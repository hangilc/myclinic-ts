import type { VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import api from "@/lib/api";

// 単純撮影（イ）の写真診断には、枚数が必要
// 170000410: 単純撮影（イ）の写真診断
export async function checkXpShindan(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = []
  for(let visit of visits){
    const shindan = visit.conducts
      .flatMap(c => c.shinryouList)
      .find(s => s.shinryoucode === 170000410)?.asConductShinryou();
    if (shindan) {
      if (shindan.memo) {
        const json = JSON.parse(shindan.memo);
        if (json.amount !== undefined) {
          continue;
        }
      }
      const err = {
        code: "単純撮影（イ）の写真診断（数量必要）",
        hint: visit.visitedAt,
        fix: async () => {
          const memo = shindan.memo ? JSON.parse(shindan.memo) : {};
          if (!("amount" in memo)) {
            memo.amount = 1;
          }
          shindan.memo = JSON.stringify(memo);
          try {
            await api.updateConductShinryou(shindan);
            return true;
          } catch (ex) {
            console.error(ex);
            return false;
          }
        }
      }
      checkErrors.push(err);
    }
  }
  return checkErrors;
}
