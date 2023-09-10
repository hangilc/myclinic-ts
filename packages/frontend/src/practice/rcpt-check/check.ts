import api from "@/lib/api";
import { isShohousen, parseShohousen } from "@/lib/shohousen/parse-shohousen";
import type { ConductShinryou, VisitEx } from "myclinic-model";
import { checkOnshi } from "./check-onshi";

export type Fixer = () => Promise<boolean>;
export type CheckError = { code: string, fix?: Fixer, hint?: string };
export type CheckResult = "ok" | "no-visit" | CheckError[];

export async function checkForRcpt(visits: VisitEx[]): Promise<CheckResult> {
  if (visits.length === 0) {
    return "no-visit";
  }
  const errs: CheckError[] = [];
  function chk(err: CheckError | undefined) {
    if (err) {
      errs.push(err);
    }
  }
  visits.forEach(visit => chk(checkGeneric1(visit)));
  visits.forEach(visit => chk(checkXpSatsuei(visit)));
  visits.forEach(visit => chk(checkXpShindan(visit)));
  (await Promise.all(visits.map(visit => checkOnshi(visit)))).forEach(e => chk(e));
  return errs.length === 0 ? "ok" : errs;
}

// 単純撮影（アナログ撮影）には、枚数と部位が必要
// 170001910: 単純撮影（アナログ撮影）
function checkXpSatsuei(visit: VisitEx): CheckError | undefined {
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

// 単純撮影（イ）の写真診断には、枚数が必要
// 170000410: 単純撮影（イ）の写真診断
function checkXpShindan(visit: VisitEx): CheckError | undefined {
  const shindan = visit.conducts
    .flatMap(c => c.shinryouList)
    .find(s => s.shinryoucode === 170000410)?.asConductShinryou();
  if (shindan) {
    if (shindan.memo) {
      const json = JSON.parse(shindan.memo);
      if (json.amount !== undefined ) {
        return undefined;
      }
    }
    return {
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
  } else {
    return undefined;
  }
}

// 一般名処方加算１は２品目以上の薬剤が処方されている場合に適応される。
// 120004270: 一般名処方加算１（処方箋料）
// 120003570: 一般名処方加算２（処方箋料）
function checkGeneric1(visit: VisitEx): CheckError | undefined {
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
