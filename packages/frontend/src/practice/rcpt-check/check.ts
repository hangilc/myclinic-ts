import { isShohousen, parseShohousen } from "@/lib/shohousen/parse-shohousen";
import type { VisitEx } from "myclinic-model";

export type CheckError = ["一般名処方加算１（１品目）", VisitEx];
export type CheckResult = "ok" | "no-visit"　| CheckError[];

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
function checkGeneric1(visit: VisitEx): ["一般名処方加算１（１品目）", VisitEx] | undefined {
  const idx = visit.shinryouList.findIndex(s => s.shinryoucode === 120004270);
  if( idx >= 0 ){
    let texts = visit.texts.filter(t => isShohousen(t.content));
    if( texts.length === 1 ){
      const shohousen = parseShohousen(texts[0].content);
      console.log("shohousen", shohousen);
      if( shohousen.totalDrugs === 1 ){
        return ["一般名処方加算１（１品目）", visit];
      }
    }
  }
  return undefined;
}
