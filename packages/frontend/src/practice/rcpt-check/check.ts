import type { VisitEx } from "myclinic-model";
import { checkOnshi } from "./checkers/check-onshi";
import { checkMainDisease } from "./checkers/check-main-disease";
import { checkGenericOne } from "./checkers/check-generic-one";
import { checkXpSatsuei } from "./checkers/check-xp-satsuei";
import { checkXpShindan } from "./checkers/check-xp-shindan";
import { checkGlucoseSelfMeasuring } from "./checkers/glucose-self-measuring";
import { checkDuplicate } from "./checkers/check-duplicate";
import { checkHandanryou } from "./checkers/check-handanryou";
import { checkShoshinSaishin } from "./checkers/check-shoshin-saishin";
import { checkRyouyouDouisho } from "./checkers/check-ryouyou-douisho";
import { checkShoshinByoumei } from "./checkers/check-shoshin-byoumei";
import { checkIryoujouhouShutokuKasan } from "./checkers/check-iryoujouhou-shutoku-kasan";
import { checkSaishinByoumei } from "./checkers/check-saishin-byoumei";
import { checkByoumei } from "./checkers/check-byoumei";
import { checkNonEmptyMeisai } from "./checkers/check-non-empty-meisai";
import { checkIryouJohoShutokuShoshinSaishin } from "./checkers/check-iryou-joho-shutoku-shosin-saishin";
import { checkGairaiSeikactsuConflict } from "./checkers/check-gairai-seikatsu-conflict";

export type CheckError = {
  code: string;
  fix?: () => Promise<boolean>;
  hint?: string;
};
export interface Fixer {
  fix: () => Promise<boolean>;
  hint: string;
}
export type CheckErrorWithFixers = { code: string; fixers: Fixer[] };
export type CheckResult = "ok" | "no-visit" | CheckErrorWithFixers[];
export type RcptChecker = (visits: VisitEx[]) => Promise<CheckErrorWithFixers[]>;

function convSingle(
  checker: (visits: VisitEx[]) => Promise<CheckError[]>
): RcptChecker {
  return async (visits) => {
    let err = await checker(visits);
    return err.map((e) => ({
      code: e.code,
      fixers: e.fix ? [{ fix: e.fix, hint: e.hint ?? "" }] : [],
    }));
  };
}

const checkers: RcptChecker[] = [
  convSingle(checkGenericOne),
  convSingle(checkXpSatsuei),
  convSingle(checkXpShindan),
  convSingle(checkOnshi),
  checkMainDisease,
  convSingle(checkGlucoseSelfMeasuring),
  convSingle(checkDuplicate),
  convSingle(checkHandanryou),
  convSingle(checkShoshinSaishin),
  convSingle(checkRyouyouDouisho),
  convSingle(checkIryoujouhouShutokuKasan),
  convSingle(checkShoshinByoumei),
  convSingle(checkSaishinByoumei),
  convSingle(checkByoumei),
  convSingle(checkNonEmptyMeisai),
  convSingle(checkIryouJohoShutokuShoshinSaishin),
  convSingle(checkGairaiSeikactsuConflict),
];

export async function checkForRcpt(visits: VisitEx[]): Promise<CheckResult> {
  if (visits.length === 0) {
    return "no-visit";
  }
  const errors: CheckErrorWithFixers[] = [];
  for (let checker of checkers) {
    const errs = await checker(visits);
    errors.push(...errs);
  }
  return errors.length === 0 ? "ok" : errors;
}
