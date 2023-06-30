import { sort診療識別コードCodeList, type 症状詳記区分コードCode, type 診療識別コードCode, type 負担区分コードCode } from "./codes";
import { Santeibi } from "./santeibi";

export interface TekiyouItem {
  isSame(other: any): boolean;
  toRecords(santeibi: Santeibi): string[];
  getTen(): number;
  getFutanKubun(): 負担区分コードCode;
}

class CombineUnit {
  shikibetsu: 診療識別コードCode;
  item: TekiyouItem;
  santei: Santeibi;

  constructor(shikibetsu: 診療識別コードCode, item: TekiyouItem, sqldate: string) {
    this.shikibetsu = shikibetsu;
    this.item = item;
    this.santei = new Santeibi();
    this.santei.add(sqldate);
  }

  tryAdd(arg: TekiyouItem, sqldate: string): boolean {
    if (this.item.isSame(arg)) {
      this.santei.add(sqldate);
      return true;
    } else {
      return false;
    }
  }

  toRecords(): string[] {
    return this.item.toRecords(this.santei);
  }
}

export class Combiner {
  units: CombineUnit[] = [];
  isSorted: boolean = false;

  combine(
    shikibetsu: 診療識別コードCode,
    item: TekiyouItem,
    sqldate: string): void {
    for (let unit of this.units) {
      if (unit.tryAdd(item, sqldate)) {
        return;
      }
    }
    this.units.push(new CombineUnit(shikibetsu, item, sqldate));
    this.isSorted = false;
  }

  sort(): void {
    this.units.sort((a, b) => a.shikibetsu.localeCompare(b.shikibetsu));
    this.isSorted = true;
  }

  ensureSorted(): void {
    if (!this.isSorted) {
      this.sort();
    }
  }

  iter(f: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, ten: number, count: number) => void): void {
    this.ensureSorted();
    this.units.forEach(unit => {
      const shikibetsu = unit.shikibetsu;
      const futanKubun = unit.item.getFutanKubun();
      const ten = unit.item.getTen();
      const count = unit.santei.getSum();
      f(shikibetsu, futanKubun, ten, count);
    })
  }

  toRecords(): string[] {
    this.ensureSorted();
    const recs: string[] = [];
    this.units.forEach(unit => recs.push(...unit.toRecords()));
    return recs;
  }
}
