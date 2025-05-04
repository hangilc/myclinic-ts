import type { VisitEx } from "myclinic-model";
import { checkOnshi } from "./checkers/check-onshi";
import { checkMainDisease } from "./checkers/main-disease";
import { checkGenericOne } from "./checkers/check-generic-one";
import { checkXpSatsuei } from "./checkers/check-xp-satsuei";
import { checkXpShindan } from "./checkers/check-xp-shindan";
import { checkGlucoseSelfMeasuring } from "./checkers/glucose-self-measuring";
import { checkDuplicate } from "./checkers/check-duplicate";
import { checkHandanryou } from "./checkers/check-handanryou";
import { checkShoshinSaishin } from "./checkers/check-shoshin-saishin";

export type Fixer = () => Promise<boolean>;
export type CheckError = { code: string, fix?: Fixer, hint?: string };
export type CheckResult = "ok" | "no-visit" | CheckError[];
export type RcptChecker = (visits: VisitEx[]) => Promise<CheckError[]>;

const checkers: RcptChecker[] = [
  checkGenericOne,
  checkXpSatsuei,
  checkXpShindan,
  checkOnshi,
  checkMainDisease,
  checkGlucoseSelfMeasuring,
  checkDuplicate,
  checkHandanryou,
  checkShoshinSaishin,
];

export async function checkForRcpt(visits: VisitEx[]): Promise<CheckResult> {
  if (visits.length === 0) {
    return "no-visit";
  }
  const errors: CheckError[] = [];
  for (let checker of checkers) {
    const errs = await checker(visits);
    errors.push(...errs);
  }
  return errors.length === 0 ? "ok" : errors;
}



