import type { VisitEx } from "myclinic-model";
import type { CheckError } from "../check";
import { isShohousen, parseShohousen } from "@/lib/shohousen/parse-shohousen";
import api from "@/lib/api";

// 一般名処方加算１は２品目以上の薬剤が処方されている場合に適応される。
// 120004270: 一般名処方加算１（処方箋料）
// 120003570: 一般名処方加算２（処方箋料）
export async function checkGenericOne(visit: VisitEx): Promise<CheckError | undefined> {
  const idx = visit.shinryouList.findIndex(s => s.shinryoucode === 120004270);
  if (idx >= 0) {
    let texts = visit.texts.filter(t => isShohousen(t.content));
    if (texts.length === 1) {
      const shohousen = parseShohousen(texts[0].content);
      if (shohousen.totalDrugs === 1) {
        return {
          code: "一般名処方加算１（１品目）",
          hint: visit.visitedAt.toString(),
          fix: async () => {
            try {
              const shinryou = visit.shinryouList[idx];
              await api.deleteShinryou(shinryou.shinryouId);
              await api.batchEnterShinryou(visit.visitId, [120003570]);
              return true;
            } catch (ex) {
              console.error(ex);
              return false;
            }
          }
        }
      }
    }
  }
  return undefined;
}
