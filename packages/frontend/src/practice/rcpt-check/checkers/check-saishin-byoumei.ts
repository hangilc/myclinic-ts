import type { Disease, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { isSaishinName } from "./helper";
import api from "@/lib/api";

export async function checkSaishinByoumei(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  for(let visit of visits){
    for(let shinryou of visit.shinryouList){
      const name = shinryou.master.name;
      if( isSaishinName(name) ){
        const at = visit.visitedAt.substring(0, 10);
        let ds = await api.listDiseaseActiveAt(visit.patient.patientId, at, at);
        if( ds.length === 0 ){
          checkErrors.push({
            code: "再診時、病名がありません"
          })
        }
      }
    }
  }
  return checkErrors;
}


