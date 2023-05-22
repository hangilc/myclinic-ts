import type { IyakuhinMaster } from "myclinic-model";
import { 診療識別コード, type 診療識別コードCode, type 負担区分コードCode } from "./codes";
import { Santeibi } from "./santeibi";
import { calcFutanKubun, hasHoken, kizaiKingakuToTen, shochiYakuzaiKingakuToTen } from "./util";
import type { IyakuhinItem, VisitItem } from "./visit-item";

interface ItemUnit {
  isEqual(arg: any): boolean;
  toItems(santeibi: Santeibi): IyakuhinItem[];
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

  toItems(): IyakuhinItem[] {
    const items: IyakuhinItem[] = [];
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

  toItems(santeibi: Santeibi): IyakuhinItem[] {
    return [{
      shikibetsucode: this.shikibetsucode,
      futanKubun: this.futanKubun,
      iyakuhincode: this.master.iyakuhincode,
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
    conduct.drugs.forEach(drug => {
      units.push(new SingleUnit(
        診療識別コード.処置, futanKubun, drug.master, drug.amount
      ));
    });
  })
  return units;
}

export function composeIyakuhinItems(visitItems: VisitItem[], kouhiIdList: number[]): IyakuhinItem[] {
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
