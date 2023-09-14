import type { Patient } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";
import { convertHankakuKatakanaToZenkakuHiragana } from "./zenkaku";
import * as kanjidate from "kanjidate";

export type OnshiPatientInconsistencyKind = "名前" | "よみ" | "生年月日" | "性別";

const KindMap: Record<OnshiPatientInconsistencyKind, string> = {
  "名前": "name",
  "よみ": "yomi",
  "生年月日": "birthday",
  "性別": "sex,"
};

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

  kindSlug(): string {
    return KindMap[this.kind];
  }

  toString(): string {
    return `患者の${this.kind}が一致しません。登録されている情報：${this.patientValue}。確認された情報：${this.onshiValue}。`;
  }
}

function patientNameEqv(patient: Patient): (onshiValue: string, patientValue: string) => boolean {
  return (onshiValue, patientValue) => {
    if( onshiValue === patientValue ){
      return true;
    }
    const onshiName = patient.memoAsJson["onshi-name"];
    if( onshiName && onshiValue === onshiName ){
      return true;
    }
    return false;
  }
}

export function checkOnshiPatientConsistency(ri: ResultItem, patient: Patient): OnshiPatientInconsistency[] {
  const errors: OnshiPatientInconsistency[] = [];
  cmp("名前", ri.name, patient.fullName("　"), errors, { eqv: patientNameEqv(patient) });
  cmp("生年月日", ri.birthdate, patient.birthday, errors, { rep: s => kanjidate.format(kanjidate.f2, s) });
  cmp("性別", ri.sex, patient.sexAsKanji, errors);
  return errors;
}

export interface CmpOpts {
  eqv?: (a: string, b: string) => boolean;
  rep?: (a: string) => string;
}

function cmp(kind: OnshiPatientInconsistencyKind, onshiValue: string, patientValue: string,
  errs: OnshiPatientInconsistency[],
  {
    eqv = (a: string, b: string) => a === b,
    rep = (a: string) => a,
  }: CmpOpts = {}): void {
  if (!eqv(onshiValue, patientValue)) {
    errs.push(new OnshiPatientInconsistency(kind, rep(onshiValue), rep(patientValue)));
  }
}

function equalWithCharCmp(a: string, b: string, charCmp: (ca: string, cb: string) => boolean): boolean {
  if (a === b) {
    return true;
  } else {
    const as = a.split("");
    const bs = b.split("");
    if (as.length === bs.length) {
      for (let i = 0; i < as.length; i++) {
        if (!charCmp(as[i], bs[i])) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
}

const variantMap: Record<string, string> = {
  "國": "国",
  "邉": "辺",
  "邊": "辺",
  "彌": "弥",
  "補": "輔",
  "巖": "巌",
  "禮": "礼",
  "惠": "恵",
  "ゃ": "や",
  "ゅ": "ゆ",
  "ょ": "よ",
}

function normalizeVariant(c: string): string {
  return variantMap[c] ?? c;
}

function equalName(a: string, b: string): boolean {
  function eq(ca: string, cb: string): boolean {
    return ca === cb || ca === "●" || cb === "●" ||
      (normalizeVariant(ca) === normalizeVariant(cb));
  }
  return equalWithCharCmp(a, b, eq);
}

// const kanaVariantMap: Record<string, string> = {
//   "ゃ": "や",
//   "ゅ": "ゆ",
//   "ょ": "よ",
//   "ェ": "ぇ",
// }

// function equalYomi(a: string, b: string): boolean {
//   function norm(c: string): string {
//     return kanaVariantMap[c] ?? c;
//   }

//   function eq(ca: string, cb: string): boolean {
//     return ca === cb || (norm(ca) === norm(cb));
//   }

//   return equalWithCharCmp(a, b, eq);
// }