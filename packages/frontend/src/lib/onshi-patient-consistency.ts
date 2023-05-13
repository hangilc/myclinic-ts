import type { Patient } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";

export type OnshiPatientInconsistencyKind = "名前" | "よみ" | "生年月日" | "性別";

export class OnshiPatientInconsistency {
  readonly isOnshiPatientInconsistency = true;
  kind: OnshiPatientInconsistencyKind;
  onshiValue: string;
  patientValue: string;

  constructor(kind: OnshiPatientInconsistencyKind, onshiValue: string, patientValue: string) {
    this.kind = kind;
    this.onshiValue = onshiValue;
    this.patientValue = patientValue;
  }

  toString(): string {
    return `患者の${this.kind}が一致しません。登録されている情報：${this.patientValue}。確認された情報：${this.onshiValue}`;
  }
}

export function checkOnshiPatientConsistency(ri: ResultItem, patient: Patient): OnshiPatientInconsistency[] {
  const errors: OnshiPatientInconsistency[] = [];
  cmp("名前", ri.name, patient.fullName("　"), errors, equalWithMasked);
  if( ri.nameKana ){
    cmp("よみ", ri.nameKana, patient.fullYomi(" "), errors);
  }
  cmp("生年月日", ri.birthdate, patient.birthday, errors);
  return errors;
}

function cmp(kind: OnshiPatientInconsistencyKind, onshiValue: string, patientValue: string,
  errs: OnshiPatientInconsistency[],
  eqv: (a: string, b: string) => boolean = (a, b) => a === b): void {
    if( !eqv(onshiValue, patientValue) ){
      errs.push(new OnshiPatientInconsistency(kind, onshiValue, patientValue));
    }
}

function equalWithMasked(a: string, b: string): boolean {
  function eq(ca: string, cb: string): boolean {
    return ca === cb || ca === "●" || cb === "●";
  }
  const as = a.split("");
  const bs = b.split("");
  if (as.length === bs.length) {
    for (let i = 0; i < as.length; i++) {
      if (!eq(as[i], bs[i])) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}