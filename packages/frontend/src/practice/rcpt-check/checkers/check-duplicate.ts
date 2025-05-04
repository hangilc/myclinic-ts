import type { ShinryouEx, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import api from "@/lib/api";

let allowedDuplicateNames: string[] = [
  "非特異的ＩｇＥ定量",
  "非特異的ＩｇＥ半定量",
  "診療情報提供料（１）"
]

export async function checkDuplicate(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = [];
  for(let visit of visits){
    const codeMap: Record<number, ShinryouEx[]> = {};
    for (let shinryou of visit.shinryouList) {
      if( allowedDuplicateNames.indexOf(shinryou.master.name) >= 0) {
        continue;
      }
      let bind = codeMap[shinryou.master.shinryoucode];
      if( bind ){
        bind.push(shinryou);
      } else {
        codeMap[shinryou.master.shinryoucode] = [shinryou];
      }
    }
    for(let key in codeMap){
      const list: ShinryouEx[] = codeMap[key];
      if( list.length > 1 ){
        let dups: ShinryouEx[] = list.slice(1);
        checkErrors.push({
          code: `重複：${list[0].master.name}`,
          fix: async () => batchDeleteShinryou(dups),
          hint: "重複診療行為の削除",
        })
      }
    }
  }
  return checkErrors;
}

async function batchDeleteShinryou(list: ShinryouEx[]): Promise<boolean> {
  await Promise.all(list.map(s => api.deleteShinryou(s.shinryouId)));
  return true;
}
