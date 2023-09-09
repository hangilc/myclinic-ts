import api from "@/lib/api";
import { isShohousen, parseShohousen } from "@/lib/shohousen/parse-shohousen";
import type { VisitEx } from "myclinic-model";

export type Fixer = () => Promise<boolean>;
export type CheckError = { code: string, fix?: Fixer };
export type CheckResult = "ok" | "no-visit" | CheckError[];

export function checkForRcpt(visits: VisitEx[]): CheckResult {
  if( visits.length === 0 ){
    return "no-visit";
  }
  const errs: CheckError[] = [];
  function chk(err: CheckError | undefined) {
    if( err ){
      errs.push(err);
    }
  }
  visits.forEach(visit => chk(checkGeneric1(visit)));
  return errs.length === 0 ? "ok" : errs;
}

// 一般名処方加算１は２品目以上の薬剤が処方されている場合に適応される。
// 120004270: 一般名処方加算１（処方箋料）
// 120003570: 一般名処方加算２（処方箋料）
function checkGeneric1(visit: VisitEx): CheckError | undefined {
  const idx = visit.shinryouList.findIndex(s => s.shinryoucode === 120004270);
  if( idx >= 0 ){
    let texts = visit.texts.filter(t => isShohousen(t.content));
    if( texts.length === 1 ){
      const shohousen = parseShohousen(texts[0].content);
      if( shohousen.totalDrugs === 1 ){
        return {
          code: "一般名処方加算１（１品目）",
          fix: async () => {
            try {
              const shinryou = visit.shinryouList[idx];
              await api.deleteShinryou(shinryou.shinryouId);
              await api.batchEnterShinryou(visit.visitId, [120003570]);
              return true;
            } catch(ex) {
              console.log(ex);
              return false;
            }
          }
        }
      }
    }
  }
  return undefined;
}
