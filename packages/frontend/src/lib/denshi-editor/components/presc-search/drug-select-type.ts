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