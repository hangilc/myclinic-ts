import type { ShinryouEx, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";

export async function checkShoshinSaishin(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  for(let visit of visits){
    const list: ShinryouEx[] = [];
    for(let shinryou of visit.shinryouList) {
      const name = shinryou.master.name;
      if( isShoshin(name) || isSaishin(name) ){
        list.push(shinryou);
      }
    }
    if( list.length > 1 ){
      const names = list.map(s => s.master.name);
      checkErrors.push({
        code: `初診再診重複（${names.join("・")}）`,
      })
    }
  }
  return checkErrors;
}

function isShoshin(name: string): boolean {
  const list = ["初診", "初診料"];
  return list.indexOf(name) >= 0;
}

function isSaishin(name: string): boolean {
  const list = ["再診（診療所）", "再診", "再診料", "同日再診（診療所）", "同日再診", "同日再診料"];
  return list.indexOf(name) >= 0;
}
