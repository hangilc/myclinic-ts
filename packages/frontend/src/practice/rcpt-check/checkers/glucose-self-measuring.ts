import type { ShinryouEx, VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { ShinryouMemoWrapper } from "@/lib/shinryou-memo";


// 血糖自己測定器加算（６０回以上）（１型糖尿病の患者等を除く）
// shinryoucode = 114007410 を算定した場合には、
// 診療行為に対してコメントをくわえなければならない。
export async function checkGlucoseSelfMeasuring(visit: VisitEx):
  Promise<CheckError | undefined> {
  const slist: ShinryouEx[] = [];
  visit.shinryouList.forEach(shinryou => {
    if (shinryou.shinryoucode === 114007410) {
			let memo = new ShinryouMemoWrapper(shinryou.memo);
			let comments = memo.getComments();
      console.log("found", comments);
    }
  });
  return undefined;
}


