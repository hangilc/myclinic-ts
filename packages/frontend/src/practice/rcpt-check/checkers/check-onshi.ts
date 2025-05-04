import api from "@/lib/api";
import type { VisitEx } from "myclinic-model";
import type { CheckError } from "../check";

export async function checkOnshi(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = [];
  for(let visit of visits){
    const onshi = await api.findOnshi(visit.visitId);
    if( onshi ){
      continue;
    } else {
      const err = {
        code: "オンライン資格確認なし",
        hint: visit.visitedAt,
      }
      checkErrors.push(err);
    }
  }
  return checkErrors;
}
