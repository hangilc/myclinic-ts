import { type VisitEx } from "myclinic-model";
import type { CheckError } from "../check";

export async function checkNonEmptyMeisai(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = [];
  for(let visit of visits){
    let n = 0;
    n += visit.shinryouList.length;
    n += visit.drugs.length;
    for(let c of visit.conducts){
      n += c.shinryouList.length;
      n += c.drugs.length;
      n += c.kizaiList.length;
    }
    if( n === 0 ){
      let p = visit.patient;
      let code = [
        "請求項目がありません。",
        `(${p.patientId}) ${p.lastName}${p.firstName} ${visit.visitedAt}`
      ].join("")
      checkErrors.push({
          code
      })
    }
  }
  return checkErrors;
}
