import { Koukikourei, Shahokokuho, type Patient } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";

import { toHankaku } from "./zenkaku";
import { checkOnshiPatientConsistency, type OnshiPatientInconsistency } from "./onshi-patient-consistency";
import { checkOnshiKoukikoureiConsistency, checkOnshiShahokokuhoConsistency, type OnshiHokenConsistencyError, type OnshiHokenInconsistency } from "./onshi-hoken-consistency";

export interface OnshiInconsistency {
  patientInconsistency: OnshiPatientInconsistency[];
  hokenInconsistency: OnshiHokenConsistencyError[];
}

export function checkOnshiInconsistency(ri: ResultItem, patient: Patient, hoken: Shahokokuho | Koukikourei | undefined):
  OnshiInconsistency {
  const result: OnshiInconsistency = {
    patientInconsistency: checkOnshiPatientConsistency(ri, patient),
    hokenInconsistency: [],
  };
  if (hoken) {
    if (hoken instanceof Shahokokuho) {
      result.hokenInconsistency = checkOnshiShahokokuhoConsistency(ri, hoken);
    } else if (hoken instanceof Koukikourei) {
      result.hokenInconsistency = checkOnshiKoukikoureiConsistency(ri, hoken);
    }
  }
  return result;
}

