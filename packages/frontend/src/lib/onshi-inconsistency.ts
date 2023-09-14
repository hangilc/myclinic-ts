import type { Patient } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";
import * as kanjidate from "kanjidate";

export type OnshiInconsistencyKind = "patient-name" | "patient-yomi" | "patient-birthday" | "patient-sex";

export class OnshiInconsistency {
  kind: OnshiInconsistencyKind;
  message: string;

  constructor(kind: OnshiInconsistencyKind, message: string) {
    this.kind = kind;
    this.message = message;
  }

  toString(): string {
    return this.message;
  }
}

function fmtDate(sqldate: string): string {
  return kanjidate.format(kanjidate.f2, sqldate);
}

function isConsistentPatientName(resultName: string, patient: Patient): boolean {
  const onshiName = patient.memoAsJson["onshi-name"];
  if (onshiName) {
    return resultName === onshiName;
  } else {
    {
      return resultName === patient.fullName("　") || resultName === patient.fullName(" ");
    }
  }
}

export function checkOnshiPatientInconsistency(ri: ResultItem, patient: Patient): OnshiInconsistency[] {
  const errors: OnshiInconsistency[] = [];
  function cmp(kind: OnshiInconsistencyKind, isEqual: boolean, mkMessage: () => string) {
    if (!isEqual) {
      errors.push(new OnshiInconsistency(kind, mkMessage()));
    }
  }
  function format(kind: string, onshiValue: string, patientValue: string): string {
    return `患者の${kind}が一致しません。登録されている情報：${patientValue}。確認された情報：${onshiValue}。`;
  }
  cmp("patient-name", isConsistentPatientName(ri.name, patient), () => format("名前", ri.name, patient.fullName("　")));
  cmp("patient-birthday", ri.birthdate === patient.birthday,
    () => format("生年月日", fmtDate(ri.birthdate), fmtDate(patient.birthday)));
  cmp("patient-sex", ri.sex === patient.sexAsKanji, () => format("性別", ri.sex, patient.sexAsKanji));
  return errors;
}


