import { dateToSqlDate, Koukikourei, Shahokokuho, } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";
import { isKoukikourei } from "./hoken-rep";
import { toHankaku } from "./zenkaku";

export function shahokokuhoOnshiConsistent(
  shahokokuho: Shahokokuho,
  r: ResultItem
): string | undefined {
  const hokenshaBangou = parseInt(r.insurerNumber || "0");
  if (shahokokuho.hokenshaBangou !== hokenshaBangou) {
    return `保険者番号が一致しません。${shahokokuho.hokenshaBangou} - ${hokenshaBangou}`;
  }
  const hihokenshaKigou = r.insuredCardSymbol ?? "";
  if (toHankaku(shahokokuho.hihokenshaKigou) !== toHankaku(hihokenshaKigou)) {
    return `被保険者記号が一致しません。${shahokokuho.hihokenshaKigou} - ${hihokenshaKigou}`;
  }
  const hihokenshaBangou = r.insuredIdentificationNumber || "";
  if (toHankaku(stripLeadingZero(shahokokuho.hihokenshaBangou)) !== toHankaku(stripLeadingZero(hihokenshaBangou))) {
    return `被保険者番号が一致しません。${shahokokuho.hihokenshaBangou} - ${hihokenshaBangou}`;
  }
  const edaban = r.insuredBranchNumber || "";
  if (shahokokuho.edaban !== "" && toHankaku(stripLeadingZero(shahokokuho.edaban)) !== toHankaku(stripLeadingZero(edaban))) {
    return `枝番が一致しません。${shahokokuho.edaban} - ${edaban}`;
  }
  const kourei: number = r.kourei != undefined ? r.kourei.futanWari ?? 0 : 0;
  if (shahokokuho.koureiStore !== kourei) {
    return `高齢が一致しません。${shahokokuho.koureiStore} - ${kourei}`;
  }
  if (r.personalFamilyClassification != undefined) {
    const honnin = r.personalFamilyClassification;
    if (honnin === "本人") {
      if (shahokokuho.honninStore === 0) {
        return `本人・家族が一致しません。${shahokokuho.honninStore} - ${honnin}`;
      }
    } else {
      if (shahokokuho.honninStore !== 0) {
        return `本人・家族が一致しません。${shahokokuho.honninStore} - ${honnin}`;
      }
    }
  }
  return undefined;
}

export function koukikoureiOnshiConsistent(
  koukikourei: Koukikourei,
  r: ResultItem
): string | undefined {
  const hokenshaBangou = r.insurerNumber ?? "";
  if (stripLeadingZero(koukikourei.hokenshaBangou) !== stripLeadingZero(hokenshaBangou)) {
    return `保険者番号が一致しません。${koukikourei.hokenshaBangou} - ${hokenshaBangou}`;
  }
  const hihokenshaBangou = r.insuredIdentificationNumber ?? "";
  if (stripLeadingZero(koukikourei.hihokenshaBangou) !== stripLeadingZero(hihokenshaBangou)) {
    return `被保険者番号が一致しません。${koukikourei.hihokenshaBangou} - ${hihokenshaBangou}`;
  }
  const futanWari = r.koukikoureiFutanWari ?? 0;
  if (futanWari > 0 && koukikourei.futanWari !== futanWari) {
    return `負担割が一致しません。${koukikourei.futanWari} - ${futanWari}`;
  }
  return undefined;
}

function stripLeadingZero(s: string): string {
  return s.replace(/^[0０]+/, "");
}

export function create_hoken_from_onshi_kakunin(patientId: number, r: ResultItem,
  validFromDate: Date):
  Shahokokuho | Koukikourei | string {
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
  const validFrom: string = dateToSqlDate(validFromDate);
  const validUpto: string = r.insuredCardExpirationDate ?? "0000-00-00";
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
    if( honninStore === undefined ){
      return "本人・家族の情報が得られませんでした。";
    }
    const kourei = r.elderlyRecipientCertificateInfo;
    let koureiStore: number;
    if( kourei === undefined ){
      koureiStore = 0;
    } else {
      if( kourei.futanWari === undefined ){
        return "高齢受給者証の負担割合が取得できません。";
      }
      koureiStore = kourei.futanWari;

    }
    const edaban: string = r.insuredBranchNumber ?? "";
    return new Shahokokuho(0, patientId, hokenshaNumber, kigou, hihokenshaBangou, honninStore, 
      validFrom, validUpto, koureiStore, edaban)
  }
}