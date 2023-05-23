import type { ShinryouMaster } from "myclinic-model";
import {
  is診療識別コードCode, is負担区分コードName, 診療識別コードvalues, 負担区分コード, type 診療識別コードCode, type 負担区分コードCode,
  診療識別コード
} from "./codes";
import { getHoukatsuStep, houkatsuTenOf, isHoukatsuGroup, type HoukatsuGroup, type HoukatsuStep } from "./houkatsu";
import type { 診療行為レコードData } from "./records/shinryoukoui-record";
import { Santeibi } from "./santeibi";
import { calcFutanKubun, hasHoken } from "./util";
import type { VisitItem } from "./visit-item";

interface ItemUnit {
  isEqual(arg: any): boolean;
  // toItems(santeibi: Santeibi): ShinryoukouiItem[];
  toDataList(santeibi: Santeibi): 診療行為レコードData[];
}

class SingleUnit implements ItemUnit {
  readonly isSingleItem = true;
  shikibetsucode: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  master: ShinryouMaster;

  constructor(shikibetsucode: 診療識別コードCode, futanKubun: 負担区分コードCode, master: ShinryouMaster) {
    this.shikibetsucode = shikibetsucode;
    this.futanKubun = futanKubun;
    this.master = master;
  }

  isEqual(arg: any): boolean {
    if (arg instanceof SingleUnit) {
      return arg.shikibetsucode === this.shikibetsucode &&
        arg.futanKubun === this.futanKubun &&
        arg.master.shinryoucode === this.master.shinryoucode;
    } else {
      return false;
    }
  }

  // toItems(santeibi: Santeibi): ShinryoukouiItem[] {
  //   return [{
  //     shikibetsucode: this.shikibetsucode,
  //     futanKubun: this.futanKubun,
  //     shinryoucode: this.master.shinryoucode,
  //     tensuu: parseInt(this.master.tensuuStore),
  //     count: santeibi.getSum(),
  //     santeibiInfo: santeibi.getSanteibiMap()
  //   }];
  // }

  toDataList(santeibi: Santeibi): 診療行為レコードData[] {
    return [{
      診療識別: this.shikibetsucode,
      負担区分: this.futanKubun,
      診療行為コード: this.master.shinryoucode,
      点数: parseInt(this.master.tensuuStore),
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

class HoukatsuUnit implements ItemUnit {
  readonly isHoukatsuUnit = true;
  shikibetsucode: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  houkatsuStep: HoukatsuStep;
  masters: ShinryouMaster[];

  constructor(shikibetsucode: 診療識別コードCode, futanKubun: 負担区分コードCode, houkatsuStep: HoukatsuStep, master: ShinryouMaster) {
    this.shikibetsucode = shikibetsucode;
    this.futanKubun = futanKubun;
    this.houkatsuStep = houkatsuStep;
    this.masters = [master];
  }

  // toItems(santeibi: Santeibi): ShinryoukouiItem[] {
  //   if (this.masters.length === 0) {
  //     return [];
  //   } else {
  //     const g = this.masters[0].houkatsukensa
  //     if (!isHoukatsuGroup(g)) {
  //       throw new Error("Invalid houkatsu group: " + g);
  //     }
  //     let ten = houkatsuTenOf(g, this.masters.length, this.houkatsuStep);
  //     if (ten === undefined) {
  //       ten = this.masters.reduce((acc, ele) => acc + parseInt(ele.tensuuStore), 0);
  //     }
  //     const items = this.masters.map((master, index) => ({
  //       shikibetsucode: index === 0 ? this.shikibetsucode : "",
  //       futanKubun: this.futanKubun,
  //       shinryoucode: master.shinryoucode,
  //       tensuu: index === this.masters.length - 1 ? ten : undefined,
  //       count: santeibi.getSum(),
  //       santeibiInfo: santeibi.getSanteibiMap()
  //     }))
  //     return items;
  //   }
  // }

  toDataList(santeibi: Santeibi): 診療行為レコードData[] {
    if (this.masters.length === 0) {
      return [];
    } else {
      const g = this.masters[0].houkatsukensa
      if (!isHoukatsuGroup(g)) {
        throw new Error("Invalid houkatsu group: " + g);
      }
      let ten = houkatsuTenOf(g, this.masters.length, this.houkatsuStep);
      if (ten === undefined) {
        ten = this.masters.reduce((acc, ele) => acc + parseInt(ele.tensuuStore), 0);
      }
      return this.masters.map((master, index) => ({
        診療識別: index === 0 ? this.shikibetsucode : "",
        負担区分: this.futanKubun,
        診療行為コード: master.shinryoucode,
        点数: index === this.masters.length - 1 ? ten : undefined,
        回数: santeibi.getSum(),
        コメントコード１: undefined,
        コメント文字１: undefined,
        コメントコード２: undefined,
        コメント文字２: undefined,
        コメントコード３: undefined,
        コメント文字３: undefined,
        算定日情報: santeibi.getSanteibiMap(),
      }))
    }
  }

  addMaster(master: ShinryouMaster): void {
    this.masters.push(master);
    this.masters.sort((a, b) => a.shinryoucode - b.shinryoucode);
  }

  isEqual(arg: any): boolean {
    if (arg instanceof HoukatsuUnit) {
      return arg.shikibetsucode === this.shikibetsucode &&
        arg.futanKubun === this.futanKubun &&
        arg.isEqualMasters(this.masters);
    } else {
      return false;
    }
  }

  isEqualMasters(masters: ShinryouMaster[]): boolean {
    if (this.masters.length === masters.length) {
      for (let i = 0; i < masters.length; i++) {
        if (this.masters[i].shinryoucode !== masters[i].shinryoucode) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
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

  toDataList(): 診療行為レコードData[] {
    const list: 診療行為レコードData[] = [];
    this.units.forEach(([unit, santeibi]) => {
      list.push(...unit.toDataList(santeibi));
    })
    return list;
  }
}

function visitUnits(visitItem: VisitItem, kouhiIdList: number[]): ItemUnit[] {
  const units: ItemUnit[] = [];
  const futanKubun = calcFutanKubun(hasHoken(visitItem), visitItem.hoken.kouhiList.map(k => k.kouhiId), kouhiIdList);
  const houkatsuMap: Map<HoukatsuGroup, HoukatsuUnit> = new Map();
  visitItem.visitEx.shinryouList.forEach(shinryou => {
    const shinryouShubetsu = Math.floor(parseInt(shinryou.master.shuukeisaki) / 10).toString();
    if (!is診療識別コードCode(shinryouShubetsu)) {
      throw new Error("Unknown 診療識別コード: " + shinryouShubetsu);
    }
    const g = shinryou.master.houkatsukensa;
    if (isHoukatsuGroup(g)) {
      if (houkatsuMap.has(g)) {
        houkatsuMap.get(g)!.addMaster(shinryou.master);
      } else {
        const date = visitItem.visit.visitedAt.substring(0, 10);
        const step = getHoukatsuStep(date);
        houkatsuMap.set(g, new HoukatsuUnit(shinryouShubetsu, futanKubun, step, shinryou.master))
      }
    } else {
      units.push(new SingleUnit(shinryouShubetsu, futanKubun, shinryou.master));
    }
  });
  for (const unit of houkatsuMap.values()) {
    units.push(unit);
  }
  visitItem.visitEx.conducts.forEach(conduct => {
    conduct.shinryouList.forEach(shinryou => {
      units.push(new SingleUnit(
        診療識別コード.処置, futanKubun, shinryou.master
      ));
    });
  })
  return units;
}

// export function composeShinryoukouiItems(visitItems: VisitItem[], kouhiIdList: number[]): ShinryoukouiItem[] {
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

export function cvtVisitItemsToDataList(visitItems: VisitItem[], kouhiIdList: number[]): 診療行為レコードData[] {
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

