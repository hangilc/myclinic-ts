import type { Shinryou, ShinryouEx, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import api from "@/lib/api";

// 血糖自己測定器加算（６０回以上）（１型糖尿病の患者等を除く）
// shinryoucode = 114007410 を算定した場合には、
// 診療行為に対してコメントをくわえなければならない。
export async function checkGlucoseSelfMeasuring(visit: VisitEx):
  Promise<CheckError | undefined> {
  const slist: ShinryouEx[] = [];
  visit.shinryouList.forEach(shinryou => {
    if (shinryou.shinryoucode === 114007410) {
      console.log("found");
    }
  });
  return undefined;
}


