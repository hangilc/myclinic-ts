import type { Disease, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { isShoshinName } from "./helper";
import api from "@/lib/api";

export async function checkShoshinByoumei(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  for(let visit of visits){
    for(let shinryou of visit.shinryouList ){
      const name = shinryou.master.name;
      if( isShoshinName(name) ){
        const at = visit.visitedAt.substring(0, 10);
        const ds = await api.listDiseaseActiveAt(visit.patient.patientId, at, at);
        if( ds.length === 0 ){
          checkErrors.push({
            code: "初診時に病名がありません"
          })
        } else {
          if( hasPrevDisease(ds, at) ){
            checkErrors.push({
              code: "初診時に以前の病名がありませｎ"
            })
          }
        }
      }
    }
  }
  return checkErrors;
}

function hasPrevDisease(ds: Disease[], at: string): boolean {
  for(let d of ds){
    if( d.startDate < at ){
      return true;
    }
  }
  return false;
}
