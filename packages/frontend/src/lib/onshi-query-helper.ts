import { Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateRelatedConsFlgCode } from "onshi-result/codes";
import type { ResultItem } from "onshi-result/ResultItem";
import api from "./api";
import { onshiConfirm, type OnshiKakuninQuery } from "./onshi-confirm";
import { checkOnshiKoukikoureiConsistency, checkOnshiShahokokuhoConsistency, OnshiError, type OnshiHokenConsistencyError } from "./onshi-hoken-consistency";
import { checkOnshiPatientConsistency, type OnshiPatientInconsistency } from "./onshi-patient-consistency";
import { onshi_query_from_hoken } from "./onshi-query-from-hoken";
import { pad } from "./pad";

export async function onshiConfirmHoken(hoken: Shahokokuho | Koukikourei, confirmationDate: string,
  {
    limitAppConsFlag,
    queryCallback,
    idToken,
  }: {
    limitAppConsFlag?: LimitApplicationCertificateRelatedConsFlgCode;
    queryCallback?: (q: OnshiKakuninQuery) => void;
    idToken?: string,
  } = {}
):
  Promise<[OnshiResult, (OnshiHokenConsistencyError | OnshiPatientInconsistency)[]]> {
  const errors: (OnshiHokenConsistencyError | OnshiPatientInconsistency)[] = [];
  const patient: Patient = await api.getPatient(hoken.patientId);
  const query = onshi_query_from_hoken(hoken, patient.birthday, confirmationDate, limitAppConsFlag);
  if( idToken ){
    query.idToken = idToken;
  }
  if( queryCallback ){
    queryCallback(query);
  }
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
  return [result, errors];
}

