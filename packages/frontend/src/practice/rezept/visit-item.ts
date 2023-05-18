import type { HokenInfo, Patient, Visit } from "myclinic-model";
import type { OnshiResult } from "onshi-result";

export interface VisitItem {
  visit: Visit;
  hoken: HokenInfo;
  patient: Patient;
  onshiResult?: OnshiResult;
}

