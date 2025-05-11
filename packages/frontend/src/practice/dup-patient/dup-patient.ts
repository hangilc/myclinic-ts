import type { Appoint, DiseaseData, Kouhi, Koukikourei, Patient, Roujin, Shahokokuho } from "myclinic-model";

export interface DupPatient {
  patient1: Patient;
  patient2: Patient;
}

export function validateDupPatient(arg: any): DupPatient {
  return arg;
}

type NewType = Koukikourei[];

export interface HokenInfo {
  shahokokuho: Shahokokuho[];
  koukikourei: NewType;
  roujin: Roujin[];
  kouhi: Kouhi[];
}

export interface PatientInfo {
  patient: Patient;
  hokenInfo: HokenInfo;
  appoints: Appoint[];
  diseases: DiseaseData[];
  visitIds: number[];
}
