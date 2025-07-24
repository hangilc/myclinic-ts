import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";

export class DrugSelectGroup {
  data: RP剤情報;
  drugs: DrugSelectDrug[];
  selected: boolean;

  constructor(data: RP剤情報, selected: boolean) {
    this.data = data;
    this.selected = selected;
    this.drugs = data.薬品情報グループ.map(d => new DrugSelectDrug(d, false));
  }
}

export class DrugSelectDrug {
  data: 薬品情報;
  selected: boolean;

  constructor(data: 薬品情報, selected: boolean) {
    this.data = data;
    this.selected = selected;
  }
}

export function getSelectedGroups(arg: DrugSelectGroup[]): RP剤情報[] {
  const groups: RP剤情報[] = [];
  for (let g of arg) {
    if (g.selected) {
      let ds = g.drugs.filter(d => d.selected);
      if (ds.length > 0) {
        let s: RP剤情報 = Object.assign({}, g.data, {
          薬品情報グループ: ds.map(d => d.data)
        });
        groups.push(s);
      }
    }
  }
  return groups;
}