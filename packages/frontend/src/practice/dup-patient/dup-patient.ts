import type { Patient } from "myclinic-model";

export interface DupPatient {
  patient1: Patient;
  patient2: Patient;
}

export function validateDupPatient(arg: any): DupPatient {
  return arg;
}
