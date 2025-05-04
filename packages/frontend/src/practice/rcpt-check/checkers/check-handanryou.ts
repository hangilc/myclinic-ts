import type { VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { batchDeleteShinryou, ShinryouCollector } from "./helper";

export async function checkHandanryou(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  const store = new ShinryouCollector();
  const includeNames = [
    "尿・糞便等検査判断料",
    "血液学的検査判断料",
    "生化学的検査（１）判断料",
    "生化学的検査（２）判断料",
    "免疫学的検査判断料",
    "微生物学的検査判断料",
  ]
  for(let visit of visits){
    for(let s of visit.shinryouList){
      if( includeNames.indexOf(s.master.name) >= 0){
        store.add(s);
      }
    }
  }
  for(let name of Object.keys(store.map)){
    let bind = store.map[name];
    if( bind.length > 1 ){
      checkErrors.push({
        code: `判断料重複：${name}`,
        fix: () => batchDeleteShinryou(bind.slice(1)),
        hint: "重複判断料削除",
      })
    }
  }
  return checkErrors;
}
