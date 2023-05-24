import type { KizaiMaster } from "myclinic-model";
import { 診療識別コード, type 診療識別コードCode, type 負担区分コードCode } from "./codes";
import type { 特定器材レコードData } from "./records/tokuteikizai-record";
import { Santeibi } from "./santeibi";
import { calcFutanKubun, hasHoken, kizaiKingakuToTen } from "./util";
import type { VisitItem } from "./visit-item";

interface ItemUnit {
  isEqual(arg: any): boolean;
  // toItems(santeibi: Santeibi): TokuteikizaiItem[];
  toDataList(santeibi: Santeibi): 特定器材レコードData[];
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

  toDataList(): 特定器材レコードData[] {
    const list: 特定器材レコードData[] = [];
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
  master: KizaiMaster;
  amount: number;

  constructor(shikibetsucode: 診療識別コードCode, futanKubun: 負担区分コードCode, master: KizaiMaster, amount: number) {
    this.shikibetsucode = shikibetsucode;
    this.futanKubun = futanKubun;
    this.master = master;
    this.amount = amount;
  }

  isEqual(arg: any): boolean {
    if (arg instanceof SingleUnit) {
      return arg.shikibetsucode === this.shikibetsucode &&
        arg.futanKubun === this.futanKubun &&
        arg.master.kizaicode === this.master.kizaicode &&
        arg.amount === this.amount;
    } else {
      return false;
    }
  }

  calcTensuu(): number {
    return kizaiKingakuToTen(parseFloat(this.master.kingakuStore) * this.amount);
  }

  toDataList(santeibi: Santeibi): 特定器材レコードData[] {
    return [{
      診療識別: this.shikibetsucode,
      負担区分: this.futanKubun,
      特定器材コード: this.master.kizaicode,
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

  // toItems(santeibi: Santeibi): TokuteikizaiItem[] {
  //   return [{
  //     shikibetsucode: this.shikibetsucode,
  //     futanKubun: this.futanKubun,
  //     kizaicode: this.master.kizaicode,
  //     amount: this.amount,
  //     tensuu: this.calcTensuu(),
  //     count: santeibi.getSum(),
  //     santeibiInfo: santeibi.getSanteibiMap()
  //   }];
  // }
}

function visitUnits(visitItem: VisitItem, kouhiIdList: number[]): ItemUnit[] {
  const units: ItemUnit[] = [];
  const futanKubun = calcFutanKubun(hasHoken(visitItem), visitItem.hoken.kouhiList.map(k => k.kouhiId), kouhiIdList);
  visitItem.visitEx.conducts.forEach(conduct => {
    conduct.kizaiList.forEach(kizai => {
      units.push(new SingleUnit(
        診療識別コード.処置, futanKubun, kizai.master, kizai.amount
      ));
    });
  })
  return units;
}

export function cvtVisitItemsToKizaiDataList(visitItems: VisitItem[], kouhiIdList: number[]): 特定器材レコードData[] {
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

// export function composeTokuteikizaiItems(visitItems: VisitItem[], kouhiIdList: number[]): TokuteikizaiItem[] {
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