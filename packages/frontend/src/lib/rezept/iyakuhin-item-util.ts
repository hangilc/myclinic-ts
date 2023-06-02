import type { ConductDrugEx, IyakuhinMaster, Visit, VisitEx } from "myclinic-model";
import type { 診療識別コードCode, 負担区分コードCode } from "./codes";
import type { 医薬品レコードData } from "./records/iyakuhin-record";
import type { Santeibi } from "./santeibi";
import { calcFutanKubun, shikibetsuOfConduct, shochiYakuzaiKingakuToTen, visitHasHoken, withClassified } from "./util";
import { Combiner, type TekiyouItem, type VisitItem } from "./visit-item";

class SingleUnit implements TekiyouItem<医薬品レコードData> {
  readonly isSingleItem = true;
  master: IyakuhinMaster;
  amount: number;

  constructor(master: IyakuhinMaster, amount: number) {
    this.master = master;
    this.amount = amount;
  }

  isSame(arg: any): boolean {
    if (arg instanceof SingleUnit) {
      return arg.master.iyakuhincode === this.master.iyakuhincode &&
        arg.amount === this.amount;
    } else {
      return false;
    }
  }

  get ten(): number {
    console.log("yakka", this.master.yakkaStore, "amount", this.amount,
      shochiYakuzaiKingakuToTen(parseFloat(this.master.yakkaStore) * this.amount));
    return shochiYakuzaiKingakuToTen(parseFloat(this.master.yakkaStore) * this.amount);
  }

  get label(): string {
    return `${this.master.name} ${this.amount}${this.master.unit}`;
  }

  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): 医薬品レコードData[] {
    return [{
      診療識別: shikibetsu,
      負担区分: futanKubun,
      医薬品コード: this.master.iyakuhincode,
      使用量: this.amount,
      点数: this.ten,
      回数: santeibi.getSum(),
      コメントコード１: undefined,
      コメント文字１: undefined,
      コメントコード２: undefined,
      コメント文字２: undefined,
      コメントコード３: undefined,
      コメント文字３: undefined,
      算定日情報: santeibi.getSanteibiMap(),
    }];
  }
}

function resolveConductDrugKouhi(drug: ConductDrugEx, visit: Visit): number[] {
  return visit.kouhiIdList;
}

export function processIyakuhinOfVisitEx(visitEx: VisitEx, kouhiIdList: number[],
  handler: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, sqldate: string,
    item: SingleUnit) => void): void {
  const visit: Visit = visitEx.asVisit;
  const sqldate = visit.visitedAt.substring(0, 10);
  const conductDrugs: [診療識別コードCode, ConductDrugEx][] =
    visitEx.conducts
      .flatMap(c => {
        const shikibetsu = shikibetsuOfConduct(c.kind.code);
        return c.drugs.map((cs) : [診療識別コードCode, ConductDrugEx] => [shikibetsu, cs]);
      });
  const list = conductDrugs;
  function resolveFutanKubun(d: ConductDrugEx): 負担区分コードCode {
    return calcFutanKubun(
      visitHasHoken(visit),
      resolveConductDrugKouhi(d, visit),
      kouhiIdList);
  }
  withClassified(list, (shikibetsu, ss) => {
    withClassified(ss.map(s => [resolveFutanKubun(s), s]), (futanKubun, ds) => {
      ds.forEach(d => {
        const unit = new SingleUnit(d.master, d.amount);
        handler(shikibetsu, futanKubun, sqldate, unit);
      });
    })
  })
}

// export function processIyakuhinOfVisit(visitItem: VisitItem,
//   kouhiIdList: number[],
//   handler: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, sqldate: string,
//     item: SingleUnit) => void): void {
//   const visitEx = visitItem.visitEx;
//   const sqldate = visitItem.visit.visitedAt.substring(0, 10);
//   const conductDrugs: [診療識別コードCode, ConductDrugEx][] =
//     visitEx.conducts
//       .flatMap(c => {
//         const shikibetsu = shikibetsuOfConduct(c.kind.code);
//         return c.drugs.map((cs) : [診療識別コードCode, ConductDrugEx] => [shikibetsu, cs]);
//       });
//   const list = conductDrugs;
//   function resolveFutanKubun(d: ConductDrugEx): 負担区分コードCode {
//     return calcFutanKubun(
//       hasHoken(visitItem),
//       resolveConductDrugKouhi(d, visitItem.visit),
//       kouhiIdList);
//   }
//   withClassified(list, (shikibetsu, ss) => {
//     withClassified(ss.map(s => [resolveFutanKubun(s), s]), (futanKubun, ds) => {
//       ds.forEach(d => {
//         const unit = new SingleUnit(d.master, d.amount);
//         handler(shikibetsu, futanKubun, sqldate, unit);
//       });
//     })
//   })
// }

export function cvtVisitsToIyakuhinDataList(visitExList: VisitEx[], kouhiIdList: number[]): 医薬品レコードData[] {
  const comb = new Combiner<医薬品レコードData>();
  visitExList.forEach(visitEx => {
    processIyakuhinOfVisitEx(visitEx, kouhiIdList, (shikibetsu, futanKubun, sqldate, s) => {
      comb.combine(shikibetsu, futanKubun, sqldate, s);
    });
  });
  return comb.toDataList();
}

