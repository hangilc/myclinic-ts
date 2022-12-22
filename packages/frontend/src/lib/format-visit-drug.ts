import { DrugCategory, type DrugEx } from "myclinic-model";
import { toZenkaku } from "./zenkaku";

export function formatVisitDrug(index: number, drug: DrugEx){
  let s: string = `${index})`;
  switch(drug.category){
    case DrugCategory.Naifuku: {
      s += `${drug.master.name} ${drug.amount}${drug.master.unit} ${drug.usage} ${drug.days}日分`;
      break;
    }
    case DrugCategory.Tonpuku: {
      s += `${drug.master.name} ${drug.amount}${drug.master.unit} ${drug.usage} ${drug.days}回分`;
      break;
    }
    case DrugCategory.Gaiyou: {
      s += `${drug.master.name} ${drug.amount}${drug.master.unit} ${drug.usage}`;
      break;
    }
  }
  return toZenkaku(s);
}
