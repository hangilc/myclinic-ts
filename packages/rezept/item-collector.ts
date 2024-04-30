import { 診療識別コードName, 負担区分コードCode } from "codes";
import { HokenCollection, futanKubunCodeByHokenCollection } from "hoken-collector";
import { Hokensha, RezeptKouhi } from "rezept-types";

export interface RezeptItem {
  getTen(): number;
  getLabel(): string;
  getShikibetsu(): 診療識別コードName;
}

export const RezeptItemObject = {
  totalTenOfList(list: RezeptItem[]): number {
    return list.reduce((acc, ele) => acc + ele.getTen(), 0);
  }
}

export class ItemCollector {
  hokenCollection: HokenCollection;
  items: Map<負担区分コードCode, RezeptItem[]> = new Map();

  constructor(hokenCollection: HokenCollection) {
    this.hokenCollection = hokenCollection;
  }

  add(item: RezeptItem, hokensha: Hokensha, kouhiList: RezeptKouhi[]) {
    const code = futanKubunCodeByHokenCollection(this.hokenCollection, hokensha, kouhiList);
    let list: RezeptItem[] | undefined = this.items.get(code);
    if( list === undefined ){
      list = [];
      this.items.set(code, list);
    }
    list.push(item);
  }

  getItems(): [負担区分コードCode, RezeptItem[]][] {
    const result: [負担区分コードCode, RezeptItem[]][] = [];
    for(const [code, list] of this.items.entries()){
      result.push([code, list]);
    }
    return result;
  }
}