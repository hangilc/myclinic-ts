import type { HokenInfo, Meisai, Patient, Visit, VisitEx } from "myclinic-model";
import type { OnshiResult } from "onshi-result";

export interface VisitItem {
  visit: Visit;
  hoken: HokenInfo;
  patient: Patient;
  onshiResult?: OnshiResult;
  meisai: Meisai;
  visitEx: VisitEx;
}

