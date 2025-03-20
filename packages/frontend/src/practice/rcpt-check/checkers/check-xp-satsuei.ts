import type { VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import api from "@/lib/api";

// 単check-純撮影（アナログ撮影）には、枚数と部位が必要
// 170001910: 単純撮影（アナログ撮影）
export async function checkXpSatsuei(visit: VisitEx): Promise<CheckError | undefined> {
  const satsuei = visit.conducts
    .flatMap(c => c.shinryouList)
    .find(s => s.shinryoucode === 170001910)?.asConductShinryou();
  if (satsuei) {
    if (satsuei.memo) {
      const json = JSON.parse(satsuei.memo);
      if (json.amount !== undefined && json.comments.length > 0) {
        return undefined;
      }
    }
    return {
      code: "単純撮影（アナログ撮影）（数量、コメント必要）",
      hint: visit.visitedAt,
      fix: async () => {
        const memo = satsuei.memo ? JSON.parse(satsuei.memo) : {};
        if (!("amount" in memo)) {
          memo.amount = 1;
        }
        if (!("comments" in memo)) {
          memo.comments = [{ code: 820181220, text: "" }]
        }
        satsuei.memo = JSON.stringify(memo);
        try {
          await api.updateConductShinryou(satsuei);
          return true;
        } catch (ex) {
          console.error(ex);
          return false;
        }
      }
    }
  } else {
    return undefined;
  }
}
