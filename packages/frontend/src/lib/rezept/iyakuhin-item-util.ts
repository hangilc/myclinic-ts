import type { IyakuhinMaster } from "myclinic-model";
import { 診療識別コード, type 診療識別コードCode, type 負担区分コードCode } from "./codes";
import type { 医薬品レコードData } from "./records/iyakuhin-record";
import { Santeibi } from "./santeibi";
import { calcFutanKubun, hasHoken, kizaiKingakuToTen, shochiYakuzaiKingakuToTen } from "./util";
import type { VisitItem } from "./visit-item";

interface ItemUnit {
  isEqual(arg: any): boolean;
  toDataList(santeibi: Santeibi): 医薬品レコードData[];
}

class Combined {
  units: [ItemUnit, Santeibi][] = [];

  combine(unit: ItemUnit, sqldate: string): void {
    for (const [u, santei] of this.units) {
      if (u.isEqual(unit)) {
        santei.add(sqldate);
        return;
      }
    }
    const santei = new Santeibi();
    santei.add(sqldate);
    this.units.push([unit, santei]);
  }

  toDataList(): 医薬品レコードData[] {
    const list: 医薬品レコードData[] = [];
    this.units.forEach(([unit, santeibi]) => {
      list.push(...unit.toDataList(santeibi));
    })
    return list;

  }
}

class SingleUnit implements ItemUnit {
  readonly isSingleItem = true;
  shikibetsucode: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  master: IyakuhinMaster;
  amount: number;

  constructor(shikibetsucode: 診療識別コードCode, futanKubun: 負担区分コードCode, master: IyakuhinMaster, amount: number) {
    this.shikibetsucode = shikibetsucode;
    this.futanKubun = futanKubun;
    this.master = master;
    this.amount = amount;
  }

  isEqual(arg: any): boolean {
    if (arg instanceof SingleUnit) {
      return arg.shikibetsucode === this.shikibetsucode &&
        arg.futanKubun === this.futanKubun &&
        arg.master.iyakuhincode === this.master.iyakuhincode &&
        arg.amount === this.amount;
    } else {
      return false;
    }
  }

  calcTensuu(): number {
    console.log("yakka", this.master.yakkaStore, "amount", this.amount, 
      shochiYakuzaiKingakuToTen(parseFloat(this.master.yakkaStore) * this.amount));
    return shochiYakuzaiKingakuToTen(parseFloat(this.master.yakkaStore) * this.amount);
  }

  // toItems(santeibi: Santeibi): IyakuhinItem[] {
  //   return [{
  //     shikibetsucode: this.shikibetsucode,
  //     futanKubun: this.futanKubun,
  //     iyakuhincode: this.master.iyakuhincode,
  //     amount: this.amount,
  //     tensuu: this.calcTensuu(),
  //     count: santeibi.getSum(),
  //     santeibiInfo: santeibi.getSanteibiMap()
  //   }];
  // }

  toDataList(santeibi: Santeibi): 医薬品レコードData[] {
    return [{
      診療識別: this.shikibetsucode,
      負担区分: this.futanKubun,
      医薬品コード: this.master.iyakuhincode,
      使用量: this.amount,
      点数: this.calcTensuu(),
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

function visitUnits(visitItem: VisitItem, kouhiIdList: number[]): ItemUnit[] {
  const units: ItemUnit[] = [];
  const futanKubun = calcFutanKubun(hasHoken(visitItem), visitItem.hoken.kouhiList.map(k => k.kouhiId), kouhiIdList);
  visitItem.visitEx.conducts.forEach(conduct => {
    conduct.drugs.forEach(drug => {
      units.push(new SingleUnit(
        診療識別コード.処置, futanKubun, drug.master, drug.amount
      ));
    });
  })
  return units;
}

// export function composeIyakuhinItems(visitItems: VisitItem[], kouhiIdList: number[]): IyakuhinItem[] {
//   const combined = new Combined();
//   visitItems.forEach(visitItem => {
//     const units = visitUnits(visitItem, kouhiIdList);
//     const date = visitItem.visit.visitedAt.substring(0, 10);
//     units.forEach(unit => {
//       combined.combine(unit, date);
//     })
//   })
//   return combined.toItems();
// }

export function cvtVisitItemsToIyakuhinDataList(visitItems: VisitItem[], kouhiIdList: number[]): 医薬品レコードData[] {
  const combined = new Combined();
  visitItems.forEach(visitItem => {
    const units = visitUnits(visitItem, kouhiIdList);
    const date = visitItem.visit.visitedAt.substring(0, 10);
    units.forEach(unit => {
      combined.combine(unit, date);
    })
  })
  return combined.toDataList();
}
