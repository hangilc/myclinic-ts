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
  shoshinList.sort((a, b) => a.visitId - b.visitId);
  saishinList.sort((a, b) => a.visitId - b.visitId);
  if( shoshinList.length + saishinList.length > 1 ){
    const deleteIds: number[] = [];
    if( shoshinList.length > 0 ){
      if( shoshinList.length > 1 ){
        for(let i=1;i<shoshinList.length;i++){
          deleteIds.push(shoshinList[i].shinryouId);
        }
      }
      deleteIds.push(...saishinList.map(s => s.shinryouId));
    } else {
      for(let i=1;i<saishinList.length;i++){
        deleteIds.push(saishinList[i].shinryouId);
      }
    }
    checkErrors.push({
      code: "医療情報取得加算の重複",
      hint: "重複している医療情報加算を削除",
      fix: async () => {
        await Promise.all(deleteIds.map(id => api.deleteShinryou(id)));
        return true;
      }
    })
  }
  return checkErrors;
}

