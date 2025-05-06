import type { ShinryouEx, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { fixByDeleteShinryou, isSaishinName, isShoshinName } from "./helper";

export async function checkIryoujouhouShutokuKasan(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  for(let visit of visits){
    checkVisit(visit, checkErrors);
  }
  return checkErrors;
}

function checkVisit(visit: VisitEx, errs: CheckError[]) {
  for(let shinryou of visit.shinryouList){
    const name = shinryou.master.name;
    if( name === "医療情報取得加算（初診）") {
      if( !hasShoshin(visit.shinryouList) ){
        errs.push({
          code: "医療情報取得加算（初診）が算定されていますが、初診が同時に算定されていません。",
          hint: "医療情報取得加算（初診）を削除する",
          fix: fixByDeleteShinryou(shinryou),
        })
      }
    } else if( name === "医療情報取得加算（再診）") {
      if( !hasSaishin(visit.shinryouList)) {
        errs.push({
          code: "医療情報取得加算（再診）が算定されていますが、初診が同時に算定されていません。",
          hint: "医療情報取得加算（再診）を削除する",
          fix: fixByDeleteShinryou(shinryou),
        })
      }
    }
  }
}

function hasShoshin(list: ShinryouEx[]): boolean {
  for(let shinryou of list){
    const name = shinryou.master.name;
    if( isShoshinName(name) ){
      return true;
    }
  }
  return false;
}

function hasSaishin(list: ShinryouEx[]): boolean {
  for(let shinryou of list){
    const name = shinryou.master.name;
    if( isSaishinName(name) ){
      return true;
    }
  }
  return false;
}
