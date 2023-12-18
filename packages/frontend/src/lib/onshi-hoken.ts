import { Koukikourei, Shahokokuho, type ShahokokuhoInterface, } from "myclinic-model";
import { isKoukikourei } from "./hoken-rep";
import type { ResultItem } from "onshi-result/ResultItem";
import { toHankaku } from "./zenkaku";

export function createHokenFromOnshiResult(patientId: number, r: ResultItem):
  Shahokokuho | Koukikourei | string {
  const validFromOpt: string | undefined = r.insuredCardValidDate;
  if (validFromOpt === undefined) {
    return "保険証の有効期限開始日がありません。";
  }
  const validFrom = validFromOpt;
  const validUpto: string = r.insuredCardExpirationDate ?? "0000-00-00";
  const hokenshaBangou: string = r.insurerNumber ?? "";
  if (hokenshaBangou === "") {
    return "保険者番号が取得できません。";
  }
  const hokenshaNumber: number = parseInt(hokenshaBangou);
  if (isNaN(hokenshaNumber)) {
    return "保険者番号が数値でありません。" + hokenshaBangou;
  }
  const hihokenshaBangou: string = r.insuredIdentificationNumber ?? "";
  if (hihokenshaBangou === "") {
    return "被保険者番号が取得できません。";
  }
  if (isKoukikourei(hokenshaNumber)) {
    console.log(r);
    const futanWari: number | undefined = r.koukikoureiFutanWari;
    if (futanWari === undefined) {
      return "後期高齢保険の負担割合が取得できません。"
    }
    return new Koukikourei(0, patientId, hokenshaBangou, hihokenshaBangou, futanWari, validFrom, validUpto);
  } else {
    const kigou = r.insuredCardSymbol ?? "";
    const honninStore: number | undefined = r.honninStore;
    if (honninStore === undefined) {
      return "本人・家族の情報が得られませんでした。";
    }
    const kourei = r.elderlyRecipientCertificateInfo;
    let koureiStore: number;
    if (kourei === undefined) {
      koureiStore = 0;
    } else {
      if (kourei.futanWari === undefined) {
        return "高齢受給者証の負担割合が取得できません。";
      }
      koureiStore = kourei.futanWari;
    }
    const edaban: string = r.insuredBranchNumber ?? "";
    return new Shahokokuho(0, patientId, hokenshaNumber, kigou, hihokenshaBangou, honninStore,
      validFrom, validUpto, koureiStore, edaban)
  }
}

export type ShahokokuhoOnshiInconsistency =
  "inconsistent-hokensha-bangou" |
  "inconsistent-hihokensha-kigou" |
  "inconsistent-hihokensha-bangou" |
  "inconsistent-edaban" |
  "inconsistent-honnin-kazoku" |
  "inconsistent-kourei" |
  "inconsistent-valid-from" |
  "inconsistent-valid-upto";

export function checkShahokokuhoInconsistency(a: Shahokokuho, onshi: Shahokokuho): ShahokokuhoOnshiInconsistency[] {
  const diff: ShahokokuhoOnshiInconsistency[] = [];
  if( a.hokenshaBangou !== onshi.hokenshaBangou ){
    diff.push("inconsistent-hokensha-bangou");
  }
  if (toHankaku(a.hihokenshaKigou) !== toHankaku(onshi.hihokenshaKigou)) {
    diff.push("inconsistent-hihokensha-kigou");
  }
  if (toHankaku(a.hihokenshaBangou) !== toHankaku(onshi.hihokenshaBangou)) {
    diff.push("inconsistent-hihokensha-bangou");
  }
  if (toHankaku(a.edaban) !== toHankaku(onshi.edaban)) {
    diff.push("inconsistent-edaban");
  }
  if (a.koureiStore !== onshi.koureiStore) {
    diff.push("inconsistent-kourei");
  }
  if (a.validFrom !== onshi.validFrom) {
    diff.push("inconsistent-valid-from");
  }
  if (a.validUpto !== onshi.validUpto) {
    diff.push("inconsistent-valid-upto");
  }
  if( a.honninStore !== onshi.honninStore ){
    diff.push("inconsistent-honnin-kazoku");
  }
  return diff;
}

function stripLeadingZero(s: string): string {
  return s.replace(/^[0０]+/, "");
}

export type KoukikoureiInconsistency = 
  "inconsistent-hokensha-bangou" |
  "inconsistent-hihokensha-bangou" |
  "inconsistent-futanwari" |
  "inconsistent-valid-from" |
  "inconsistent-valid-upto";

export function checkKoukikoureiInconsistency(a: Koukikourei, onshi: Koukikourei): KoukikoureiInconsistency[] {
  const result: KoukikoureiInconsistency[] = [];
  if (toHankaku(stripLeadingZero(a.hokenshaBangou)) !== toHankaku(stripLeadingZero(onshi.hokenshaBangou))) {
    result.push("inconsistent-hokensha-bangou");
  }
  if (toHankaku(stripLeadingZero(a.hihokenshaBangou)) !== toHankaku(stripLeadingZero(onshi.hihokenshaBangou)) ) {
    result.push("inconsistent-hihokensha-bangou");
  }
  if( a.futanWari !== onshi.futanWari ){
    result.push("inconsistent-futanwari");
  }
  if (a.validFrom !== onshi.validFrom) {
    result.push("inconsistent-valid-from");
  }
  if (a.validUpto !== onshi.validUpto) {
    result.push("inconsistent-valid-upto");
  }
  return result;
}

export async function tryFixPrevHoken(prev: Shahokokuho | Koukikourei, onshi: Shahokokuho | Koukikourei): Promise<string[] | undefined> {
  if( prev instanceof Shahokokuho ){
    if( onshi instanceof Shahokokuho ){
      const inconsistencies = checkShahokokuhoInconsistency(prev, onshi);
      if( inconsistencies.length === 0 ){
        return undefined;
      }
    } else {

    }
  } else {
    if( onshi instanceof Shahokokuho ){

    } else {
      
    }
  }
}
