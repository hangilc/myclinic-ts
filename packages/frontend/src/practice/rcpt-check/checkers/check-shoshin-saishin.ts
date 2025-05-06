import type { ShinryouEx, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { isSaishinName, isShoshinName } from "./helper";

export async function checkShoshinSaishin(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  for(let visit of visits){
    const list: ShinryouEx[] = [];
    for(let shinryou of visit.shinryouList) {
      const name = shinryou.master.name;
      if( isShoshinName(name) || isSaishinName(name) ){
        list.push(shinryou);
      }
    }
    if( list.length > 1 ){
      const names = list.map(s => s.master.name);
      checkErrors.push({
        code: `初診再診重複（${names.join("・")}）`,
      })
    } else if( list.length === 0 ){
      if( visit.shinryouList.length === 1 && isException(visit.shinryouList[0]) ){
        continue;
      }
      checkErrors.push({
        code: "初診・再診なし"
      })
    }
  }
  return checkErrors;

}

function isException(shinryou: ShinryouEx): boolean {
  const okNames = [
    "療養費同意書交付料", "診療情報提供料（１）", "訪問看護指示料",
  ]
  const name = shinryou.master.name;
  if( okNames.indexOf(name) >= 0 ){
    return true;
  } else {
    return false;
  }
}

