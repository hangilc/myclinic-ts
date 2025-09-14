import { Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateRelatedConsFlgCode } from "onshi-result/codes";
import type { ResultItem } from "onshi-result/ResultItem";
import api from "./api";
import { onshiConfirm, type OnshiKakuninQuery } from "./onshi-confirm";
import { checkOnshiKoukikoureiConsistency, checkOnshiShahokokuhoConsistency, type OnshiHokenConsistencyError } from "./onshi-hoken-consistency";
import { onshi_query_from_hoken } from "./onshi-query-from-hoken";

export async function onshiConfirmByHoken(hoken: Shahokokuho | Koukikourei, confirmationDate: string,
  {
    limitAppConsFlag,
    queryCallback,
    idToken,
  }: {
    limitAppConsFlag?: LimitApplicationCertificateRelatedConsFlgCode;
    queryCallback?: (q: OnshiKakuninQuery) => void;
    idToken?: string,
  } = {}
): Promise<OnshiResult> {
  // const errors: (OnshiHokenConsistencyError | OnshiPatientInconsistency)[] = [];
  const patient: Patient = await api.getPatient(hoken.patientId);
  const query = onshi_query_from_hoken(hoken, patient.birthday, confirmationDate, limitAppConsFlag);
  if (idToken) {
    query.idToken = idToken;
  }
  if (queryCallback) {
    queryCallback(query);
  }
  return await onshiConfirm(query);
}

export type OnshiConfirmHokenResult = { ok: true, result: OnshiResult }
  | { ok: false, error: "inconsistent", messages: string[], result: OnshiResult }
  | { ok: false, error: "not-confirmed", message: string }

export function messageOfOnshiConfirmHokenResult(result: OnshiConfirmHokenResult): string {
  if (!result.ok) {
    if (result.error === "inconsistent") {
      return result.messages.join("");
    } else if (result.error == "not-confirmed") {
      return result.message;
    } else {
      return "Unknown inconsistency";
    }
  } else {
    return "";
  }
}

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
  Promise<OnshiConfirmHokenResult> {
  const result = await onshiConfirmByHoken(hoken, confirmationDate, { limitAppConsFlag, queryCallback, idToken });
  if (result.isValid) {
    const ri: ResultItem = result.resultList[0];
    // const messages: string[] = [];
    const inconsistencies: OnshiHokenConsistencyError[] = [];
    if (hoken instanceof Shahokokuho) {
      inconsistencies.push(...checkOnshiShahokokuhoConsistency(ri, hoken));
    } else {
      inconsistencies.push(...checkOnshiKoukikoureiConsistency(ri, hoken));
    }
    if (inconsistencies.length === 0) {
      return { ok: true, result };
    } else {
      return { ok: false, error: "inconsistent", messages: inconsistencies.map(s => s.toString()), result };
    }
  } else {
    return { ok: false, error: "not-confirmed", message: result.getErrorMessage() };
  }
}

