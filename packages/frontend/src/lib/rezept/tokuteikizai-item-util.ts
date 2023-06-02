import type { ConductKizaiEx, KizaiMaster, Visit, VisitEx } from "myclinic-model";
import type { 診療識別コードCode, 負担区分コードCode } from "./codes";
import type { 特定器材レコードData } from "./records/tokuteikizai-record";
import type { Santeibi } from "./santeibi";
import { calcFutanKubun, kizaiKingakuToTen, shikibetsuOfConduct, visitHasHoken, withClassified } from "./util";
import { Combiner, type TekiyouItem, type VisitItem } from "./visit-item";

type R = 特定器材レコードData;

class SingleUnit implements TekiyouItem<R> {
  readonly isSingleItem = true;
  master: KizaiMaster;
  amount: number;

  constructor( master: KizaiMaster, amount: number) {
    this.master = master;
    this.amount = amount;
  }

  isSame(arg: any): boolean {
    if (arg instanceof SingleUnit) {
      return arg.master.kizaicode === this.master.kizaicode &&
        arg.amount === this.amount;
    } else {
      return false;
    }
  }

  get ten(): number {
    return kizaiKingakuToTen(parseFloat(this.master.kingakuStore) * this.amount);
  }

  get label(): string {
    return `${this.master.name} ${this.amount}${this.master.unit}`;
  }

  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): R[] {
    return [{
      診療識別: shikibetsu,
      負担区分: futanKubun,
      特定器材コード: this.master.kizaicode,
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

function resolveConductKizaiKouhi(kizai: ConductKizaiEx, visit: Visit): number[] {
  return visit.kouhiIdList;
}

export function processKizaiOfVisitEx(visitEx: VisitEx, kouhiIdList: number[],
  handler: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, sqldate: string,
    item: SingleUnit) => void): void {
  const visit: Visit = visitEx.asVisit;
  const sqldate = visit.visitedAt.substring(0, 10);
  const conductKizaiList: [診療識別コードCode, ConductKizaiEx][] =
    visitEx.conducts
      .flatMap(c => {
        const shikibetsu = shikibetsuOfConduct(c.kind.code);
        return c.kizaiList.map((cs) : [診療識別コードCode, ConductKizaiEx] => [shikibetsu, cs]);
      });
 const list = conductKizaiList;
  function resolveFutanKubun(k: ConductKizaiEx): 負担区分コードCode {
    return calcFutanKubun(
      visitHasHoken(visit),
      resolveConductKizaiKouhi(k, visit),
      kouhiIdList);
  }
  withClassified(list, (shikibetsu, ks) => {
    withClassified(ks.map(k => [resolveFutanKubun(k), k]), (futanKubun, ds) => {
      ds.forEach(d => {
        const unit = new SingleUnit(d.master, d.amount);
        handler(shikibetsu, futanKubun, sqldate, unit);
      });
    })
  })
}

// export function processKizaiOfVisit(visitItem: VisitItem,
//   kouhiIdList: number[],
//   handler: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, sqldate: string,
//     item: SingleUnit) => void): void {
//   const visitEx = visitItem.visitEx;
//   const sqldate = visitItem.visit.visitedAt.substring(0, 10);
//   const conductKizaiList: [診療識別コードCode, ConductKizaiEx][] =
//     visitEx.conducts
//       .flatMap(c => {
//         const shikibetsu = shikibetsuOfConduct(c.kind.code);
//         return c.kizaiList.map((cs) : [診療識別コードCode, ConductKizaiEx] => [shikibetsu, cs]);
//       });
//  const list = conductKizaiList;
//   function resolveFutanKubun(k: ConductKizaiEx): 負担区分コードCode {
//     return calcFutanKubun(
//       hasHoken(visitItem),
//       resolveConductKizaiKouhi(k, visitItem.visit),
//       kouhiIdList);
//   }
//   withClassified(list, (shikibetsu, ks) => {
//     withClassified(ks.map(k => [resolveFutanKubun(k), k]), (futanKubun, ds) => {
//       ds.forEach(d => {
//         const unit = new SingleUnit(d.master, d.amount);
//         handler(shikibetsu, futanKubun, sqldate, unit);
//       });
//     })
//   })
// }

export function cvtVisitsToKizaiDataList(visitExList: VisitEx[], kouhiIdList: number[]): R[] {
  const comb = new Combiner<R>();
  visitExList.forEach(visitEx => {
    processKizaiOfVisitEx(visitEx, kouhiIdList, (shikibetsu, futanKubun, sqldate, s) => {
      comb.combine(shikibetsu, futanKubun, sqldate, s);
    });
  });
  return comb.toDataList();
}


