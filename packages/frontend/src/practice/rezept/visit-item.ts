import type { Disease, HokenInfo, Meisai, Patient, Visit, VisitEx } from "myclinic-model";
import type { OnshiResult } from "onshi-result";

export interface DiseaseItem {
  disease: Disease;
  shuushokugoCodes: number[];
  isPrimary: boolean;
}

export interface VisitItem {
  visit: Visit;
  hoken: HokenInfo;
  patient: Patient;
  onshiResult?: OnshiResult;
  meisai: Meisai;
  visitEx: VisitEx;
}

