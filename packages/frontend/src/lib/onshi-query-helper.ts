import { Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import type { LimitApplicationCertificateRelatedConsFlgCode } from "onshi-result/codes";
import type { ResultItem } from "onshi-result/ResultItem";
import api from "./api";
import { onshiConfirm, type OnshiKakuninQuery } from "./onshi-confirm";
import { checkOnshiKoukikoureiConsistency, checkOnshiShahokokuhoConsistency, OnshiError, type OnshiHokenConsistencyError } from "./onshi-hoken-consistency";
import { checkOnshiPatientConsistency, type OnshiPatientInconsistency } from "./onshi-patient-consistency";
import { pad } from "./pad";

export function onshi_query_from_hoken(
  hoken: Shahokokuho | Koukikourei,
  birthdate: string,
  confirmationDate: string,
  limitAppConsFlag?: LimitApplicationCertificateRelatedConsFlgCode): OnshiKakuninQuery {
  const base = {
    birthdate: birthdate.replaceAll("-", ""),
    confirmationDate: confirmationDate.replaceAll("-", ""),
    kigou: undefined,
    edaban: undefined,
    limitAppConsFlag: limitAppConsFlag ?? "1",
  };
  if (hoken instanceof Shahokokuho) {
    return Object.assign(base, {
      hokensha: pad(hoken.hokenshaBangou, 8, "0"),
      hihokensha: hoken.hihokenshaBangou.toString(),
      kigou: hoken.hihokenshaKigou || undefined,
      edaban: hoken.edaban || undefined,
    });
  } else {
    return Object.assign(base, {
      hokensha: pad(hoken.hokenshaBangou, 8, "0"),
      hihokensha: hoken.hihokenshaBangou,
    });
  }
}

export async function onshiConfirmHoken(hoken: Shahokokuho | Koukikourei, confirmationDate: string,
  limitAppConsFlag?: LimitApplicationCertificateRelatedConsFlgCode):
  Promise<(OnshiHokenConsistencyError | OnshiPatientInconsistency)[]> {
  const errors: (OnshiHokenConsistencyError | OnshiPatientInconsistency)[] = [];
  const patient: Patient = await api.getPatient(hoken.patientId);
  const query = onshi_query_from_hoken(hoken, patient.birthday, confirmationDate, limitAppConsFlag);
  const result = await onshiConfirm(query);
  if (result.isValid) {
    const ri: ResultItem = result.resultList[0];
    if (hoken instanceof Shahokokuho) {
      errors.push(...checkOnshiShahokokuhoConsistency(ri, hoken));
    } else {
      errors.push(...checkOnshiKoukikoureiConsistency(ri, hoken));
    }
    errors.push(...checkOnshiPatientConsistency(ri, patient));
  } else {
    errors.push(new OnshiError(result.getErrorMessage()));
  }
  return errors;
}

