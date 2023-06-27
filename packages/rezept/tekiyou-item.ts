import { sort診療識別コードCodeList, type 症状詳記区分コードCode, type 診療識別コードCode, type 負担区分コードCode } from "./codes";
import { Santeibi } from "./santeibi";

export interface TekiyouItem<R> {
  isSame(other: any): boolean;
  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): R[];
}

class CombineUnit<R> {
  item: TekiyouItem<R>;
  santei: Santeibi;

  constructor(item: TekiyouItem<R>, sqldate: string) {
    this.item = item;
    this.santei = new Santeibi();
    this.santei.add(sqldate);
  }

  tryAdd(arg: TekiyouItem<R>, sqldate: string): boolean {
    if (this.item.isSame(arg)) {
      this.santei.add(sqldate);
      return true;
    } else {
      return false;
    }
  }

  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode,): R[] {
    return this.item.toRecords(shikibetsu, futanKubun, this.santei);
  }
}

export class Combiner<R> {
  map: Map<診療識別コードCode, Map<負担区分コードCode, CombineUnit<R>[]>> = new Map();

  getShikibetsu(shikibetsu: 診療識別コードCode): Map<負担区分コードCode, CombineUnit<R>[]> {
    const bmap = this.map.get(shikibetsu);
    if (bmap) {
      return bmap;
    } else {
      const newBmap = new Map<負担区分コードCode, CombineUnit<R>[]>();
      this.map.set(shikibetsu, newBmap);
      return newBmap;
    }
  }

  combine(
    shikibetsu: 診療識別コードCode,
    futanKubun: 負担区分コードCode,
    sqldate: string,
    item: TekiyouItem<R>): void {
    const bmap = this.getShikibetsu(shikibetsu);
    const cs = bmap.get(futanKubun);
    if (cs) {
      for (let c of cs) {
        if (c.tryAdd(item, sqldate)) {
          return;
        }
      }
      cs.push(new CombineUnit(item, sqldate));
    } else {
      bmap.set(futanKubun, [new CombineUnit(item, sqldate)]);
    }
  }

  toDataList(): R[] {
    const result: R[] = [];
    const keys = Array.from(this.map.keys());
    sort診療識別コードCodeList(keys);
    for (let shikibetsu of keys) {
      const bmap = this.map.get(shikibetsu)!;
      for (let futanKubun of bmap.keys()) {
        const cs = bmap.get(futanKubun)!;
        cs.forEach(u => {
          result.push(...u.toRecords(shikibetsu, futanKubun));
        })
      }
    }
    return result;
  }
}
