import type { VisitEx } from "myclinic-model";
import { checkOnshi } from "./checkers/check-onshi";
import { checkMainDisease } from "./main-disease";
import { checkGenericOne } from "./checkers/check-generic-one";
import { checkXpSatsuei } from "./checkers/check-xp-satsuei";
import { checkXpShindan } from "./checkers/check-xp-shindan";
import { checkGlucoseSelfMeasuring } from "./checkers/glucose-self-measuring";

export type Fixer = () => Promise<boolean>;
export type CheckError = { code: string, fix?: Fixer, hint?: string };
export type CheckResult = "ok" | "no-visit" | CheckError[];
export type RcptChecker = (visit: VisitEx) => Promise<(CheckError | undefined)>;

const checkers: RcptChecker[] = [
  checkGenericOne,
  checkXpSatsuei,
  checkXpShindan,
  checkOnshi,
  checkMainDisease,
  checkGlucoseSelfMeasuring,
];

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
  for (let checker of checkers) {
    const checks = await Promise.all(visits.map(visit => checker(visit)));
    checks.forEach(chk);
  }
  return errs.length === 0 ? "ok" : errs;
}



