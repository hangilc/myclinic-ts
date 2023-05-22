import type { KizaiMaster } from "myclinic-model";
import { 診療識別コード, type 診療識別コードCode, type 負担区分コードCode } from "./codes";
import { Santeibi } from "./santeibi";
import { calcFutanKubun, hasHoken, kizaiKingakuToTen } from "./util";
import type { TokuteikizaiItem, VisitItem } from "./visit-item";

interface ItemUnit {
  isEqual(arg: any): boolean;
  toItems(santeibi: Santeibi): TokuteikizaiItem[];
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

  toItems(): TokuteikizaiItem[] {
    const items: TokuteikizaiItem[] = [];
    this.units.forEach(([unit, santeibi]) => {
      items.push(...unit.toItems(santeibi));
    })
    return items;
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

  toItems(santeibi: Santeibi): TokuteikizaiItem[] {
    return [{
      shikibetsucode: this.shikibetsucode,
      futanKubun: this.futanKubun,
      kizaicode: this.master.kizaicode,
      amount: this.amount,
      tensuu: this.calcTensuu(),
      count: santeibi.getSum(),
      santeibiInfo: santeibi.getSanteibiMap()
    }];
  }
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

export function composeTokuteikizaiItems(visitItems: VisitItem[], kouhiIdList: number[]): TokuteikizaiItem[] {
  const combined = new Combined();
  visitItems.forEach(visitItem => {
    const units = visitUnits(visitItem, kouhiIdList);
    const date = visitItem.visit.visitedAt.substring(0, 10);
    units.forEach(unit => {
      combined.combine(unit, date);
    })
  })
  return combined.toItems();
}