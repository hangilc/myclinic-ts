import { Koukikourei, Shahokokuho, type Patient } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";
import * as kanjidate from "kanjidate";
import { toHankaku } from "./zenkaku";

export type OnshiPatientInconsistencyKind = "patient-name" | "patient-yomi" | "patient-birthday" | "patient-sex";
export type OnshiShahokokuhoInconsistencyKind = "shahokokuho-hokenshabangou" | "shahokokuho-hihokenshakigou" |
  "shahokokuho-hihokenshabangou" | "shahokokuho-edaban" | "shahokokuho-kourei";
export type OnshiKoukikoureiInconsistencyKind = "koukikourei-hokenshabangou" | "koukikourei-hihokenshabangou" |
  "koukikourei-futanwari";
export type OnshiInconsistencyKind =
  OnshiPatientInconsistencyKind |
  OnshiShahokokuhoInconsistencyKind |
  OnshiKoukikoureiInconsistencyKind;

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

function stripLeadingZero(s: string): string {
  return s.replace(/^[0０]+/, "");
}

export function checkOnshiShahokokuhoInconsistency(ri: ResultItem, shahokokuho: Shahokokuho): OnshiInconsistency[] {
  const errors: OnshiInconsistency[] = [];
  function cmp(kind: OnshiInconsistencyKind, isEqual: boolean, mkMessage: () => string) {
    if (!isEqual) {
      errors.push(new OnshiInconsistency(kind, mkMessage()));
    }
  }
  function fmt(kind: string, onshiValue: string, shahokokuhoValue: string): string {
    return `社保国保の${kind}が一致しません。登録されている情報：${shahokokuhoValue}。確認された情報：${onshiValue}。`;
  }
  const hokenshaBangou = parseInt(ri.insurerNumber || "0");
  cmp("shahokokuho-hokenshabangou", shahokokuho.hokenshaBangou === hokenshaBangou,
    () => fmt("保険者番号", hokenshaBangou.toString(), shahokokuho.hokenshaBangou.toString()));
  const hihokenshaKigou = ri.insuredCardSymbol ?? "";
  cmp("shahokokuho-hihokenshakigou", toHankaku(shahokokuho.hihokenshaKigou) === toHankaku(hihokenshaKigou),
    () => fmt("被保険者記号", hihokenshaKigou, shahokokuho.hihokenshaKigou));
  const hihokenshaBangou = ri.insuredIdentificationNumber || "";
  cmp("shahokokuho-hihokenshabangou",
    toHankaku(stripLeadingZero(shahokokuho.hihokenshaBangou)) === toHankaku(stripLeadingZero(hihokenshaBangou)),
    () => fmt("被保険者番号", hihokenshaBangou, shahokokuho.hihokenshaBangou));
  const edaban = ri.insuredBranchNumber || "";
  cmp("shahokokuho-edaban", toHankaku(stripLeadingZero(shahokokuho.edaban)) === toHankaku(stripLeadingZero(edaban)),
    () => fmt("枝番", edaban, shahokokuho.edaban));
  const kourei: number = ri.kourei != undefined ? ri.kourei.futanWari ?? 0 : 0;
  cmp("shahokokuho-kourei", shahokokuho.koureiStore === kourei,
    () => fmt("高齢受給負担割", kourei.toString(), shahokokuho.koureiStore.toString()));
  return errors;
}

export function checkOnshiKoukikoureiInconsistency(ri: ResultItem, koukikourei: Koukikourei): OnshiInconsistency[] {
  const errors: OnshiInconsistency[] = [];
  function cmp(kind: OnshiInconsistencyKind, isEqual: boolean, mkMessage: () => string) {
    if (!isEqual) {
      errors.push(new OnshiInconsistency(kind, mkMessage()));
    }
  }
  function fmt(kind: string, onshiValue: string, shahokokuhoValue: string): string {
    return `後期高齢保険の${kind}が一致しません。登録されている情報：${shahokokuhoValue}。確認された情報：${onshiValue}。`;
  }
  const hokenshaBangou = ri.insurerNumber ?? "";
  cmp("koukikourei-hokenshabangou", stripLeadingZero(koukikourei.hokenshaBangou) === stripLeadingZero(hokenshaBangou),
    () => fmt("保険者番号", hokenshaBangou, koukikourei.hokenshaBangou));
  const hihokenshaBangou = ri.insuredIdentificationNumber ?? "";
  cmp("koukikourei-hihokenshabangou",
    stripLeadingZero(koukikourei.hihokenshaBangou) === stripLeadingZero(hihokenshaBangou),
    () => fmt("被保険者番号", hihokenshaBangou, koukikourei.hihokenshaBangou));
  const futanWari = ri.koukikoureiFutanWari ?? 0;
  cmp("koukikourei-futanwari", koukikourei.futanWari === futanWari,
    () => fmt("負担割", futanWari.toString(), koukikourei.futanWari.toString()));
  return errors;
}

export function checkOnshiInconsistency(ri: ResultItem, patient: Patient, hoken: Shahokokuho | Koukikourei | undefined):
  OnshiInconsistency[] {
  const errs: OnshiInconsistency[] = [];
  errs.push(...checkOnshiPatientInconsistency(ri, patient));
  if (hoken) {
    if (hoken instanceof Shahokokuho) {
      errs.push(...checkOnshiShahokokuhoInconsistency(ri, hoken));
    } else if (hoken instanceof Koukikourei) {
      errs.push(...checkOnshiKoukikoureiInconsistency(ri, hoken))
    }
  }
  return errs;
}