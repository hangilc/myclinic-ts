import { sort診療識別コードCodeList, type 症状詳記区分コードCode, type 診療識別コードCode, type 負担区分コードCode } from "./codes";
import { Santeibi } from "./santeibi";

// export interface TekiyouItem<R> {
//   isSame(other: any): boolean;
//   toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): R[];
// }

export interface TekiyouItem {
  isSame(other: any): boolean;
  toRecords(santeibi: Santeibi): string[];
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

  combine(
    shikibetsu: 診療識別コードCode,
    item: TekiyouItem,
    sqldate: string): void {
    for(let unit of this.units){
      if( unit.tryAdd(item, sqldate) ) {
        return;
      }
    }
    this.units.push(new CombineUnit(shikibetsu, item, sqldate));
  }

  toRecords(): string[] {
    this.units.sort((a, b) => a.shikibetsu.localeCompare(b.shikibetsu));
    const recs: string[] = [];
    this.units.forEach(unit => recs.push(...unit.toRecords()));
    return recs;
  }
}
