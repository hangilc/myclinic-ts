import type { ShinryouMaster } from "myclinic-model";
import { is負担区分コードName, 診療識別コードvalues, 負担区分コード, type 負担区分コードCode } from "./codes";
import { Santeibi } from "./santeibi";
import type { ShinryoukouiItem, VisitItem } from "./visit-item";

class ItemListFactory {
  futanKubun: 負担区分コードCode;
  singles: Map<number, [string, Santeibi]> = new Map()

  constructor(futanKubun: 負担区分コードCode) {
    this.futanKubun = futanKubun;
  }

  addSingle(shinryoucode: number, master: ShinryouMaster, sqldate: string): void {
    if (!(this.singles.has(shinryoucode))) {
      const shinryouShubetsu = Math.floor(parseInt(master.shuukeisaki) / 10);
      if (!診療識別コードvalues.includes(shinryouShubetsu.toString())) {
        console.log("Unknown 診療識別コード", shinryouShubetsu);
      }
      this.singles.set(shinryoucode, [shinryouShubetsu.toString(),  new Santeibi()]);
    }
    this.singles.get(shinryoucode)![1].add(sqldate);
  }

  getItems(): ShinryoukouiItem[] {
    const items: ShinryoukouiItem[] = [];
    for (let shinryoucode of this.singles.keys()) {
      const [shinryouShubetsu, santeibi] = this.singles.get(shinryoucode)!;
      items.push({
        shinryouShubetsu,
        futanKubun: this.futanKubun,
        shinryoucode,
        count: santeibi.getSum(),
        santeibiInfo: santeibi.getSanteibiMap()
      })
    }
    return items;
  }
}

class FactorySet {
  map: Map<負担区分コードCode, ItemListFactory> = new Map();

  getFactoryFor(futanKubun: 負担区分コードCode): ItemListFactory {
    if( this.map.has(futanKubun) ){
      return this.map.get(futanKubun)!;
    } else {
      const factory = new ItemListFactory(futanKubun);
      this.map.set(futanKubun, factory);
      return factory;
    }
  }

  getItems(): ShinryoukouiItem[] {
    const items: ShinryoukouiItem[] = [];
    for(const factory of this.map.values()){
      items.push(...factory.getItems());
    }
    return items;
  }
}

export function composeShinryoukouiItems(visitItems: VisitItem[], kouhiIdList: number[]): ShinryoukouiItem[] {
  const factorySet = new FactorySet();
  visitItems.forEach(visitItem => {
    const date = visitItem.visit.visitedAt.substring(0, 10);
    const futanKubun = calcFutanKubun(hasHoken(visitItem), visitItem.hoken.kouhiList.map(k => k.kouhiId), kouhiIdList);
    const factory = factorySet.getFactoryFor(futanKubun);
    visitItem.visitEx.shinryouList.forEach(shinryou => {
      const shinryouShubetsu = Math.floor(parseInt(shinryou.master.shuukeisaki) / 10);
      if (!診療識別コードvalues.includes(shinryouShubetsu.toString())) {
        console.log("Unknown 診療識別コード", shinryouShubetsu);
      }
      factory.addSingle(shinryou.shinryoucode, shinryou.master, date);
    })
  })
  return factorySet.getItems();
}

function hasHoken(visitItem: VisitItem): boolean {
  return visitItem.hoken.shahokokuho !== undefined || visitItem.hoken.koukikourei !== undefined;
}

function calcFutanKubun(hasHoken: boolean, visitKouhiIds: number[], kouhiIds: number[]): 負担区分コードCode {
  const kouhiParts: number[] = [];
  visitKouhiIds.forEach(visitKouhiId => {
    const index = kouhiIds.findIndex(e => e === visitKouhiId);
    if (index < 0) {
      throw new Error("Cannot resolve 負担区分: " + visitKouhiId);
    }
    kouhiParts.push(index + 1);
  })
  const key = (hasHoken ? "H" : "") + kouhiParts.join("");
  if (is負担区分コードName(key)) {
    return 負担区分コード[key];
  } else {
    throw new Error("Invalid 負担区分コードNam: " + key);
  }
}