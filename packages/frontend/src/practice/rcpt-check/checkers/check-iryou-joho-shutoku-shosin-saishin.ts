import api from "@/lib/api";
import type { VisitEx } from "myclinic-model";
import type { CheckError } from "../check";

export async function checkIryouJohoShutokuShoshinSaishin(
  visits: VisitEx[]
): Promise<CheckError[]> {
  const checkErrors: CheckError[] = [];
  let shoshinList: { shinryouId: number, visitId: number }[] = [];
  let saishinList: { shinryouId: number, visitId: number }[] = [];
  for(let visit of visits){
    for(let s of visit.shinryouList) {
      if( s.master.name === "医療情報取得加算（初診）" ){
        shoshinList.push({ shinryouId: s.shinryouId, visitId: visit.visitId });
      } else if( s.master.name === "医療情報取得加算（再診）" ){
        saishinList.push({ shinryouId: s.shinryouId, visitId: visit.visitId });
      }
    }
  }
  if( shoshinList.length > 0 && saishinList.length > 0 ){
    checkErrors.push({
      code: "医療情報取得加算（初診）と医療情報取得加算（再診）は同月に両方は算定できません。",
    })
  }
  return checkErrors;
}

