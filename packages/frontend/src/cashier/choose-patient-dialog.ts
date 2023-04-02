import type { Patient, Visit } from "myclinic-model";

export interface PatientData {
  patient: Patient;
  visitCount: number;
  lastVisit: Visit | undefined;
}