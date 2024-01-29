import { Koukikourei, Shahokokuho, dateToSqlDate, type ShahokokuhoInterface, } from "myclinic-model";
import { isKoukikourei } from "./hoken-rep";
import type { ResultItem } from "onshi-result/ResultItem";
import { toHankaku } from "./zenkaku";
import api from "./api";
import * as kanjidate from "kanjidate";

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
  "inconsistent-valid-upto"
  ;

export function checkShahokokuhoInconsistency(a: Shahokokuho, onshi: Shahokokuho): ShahokokuhoOnshiInconsistency[] {
  const diff: ShahokokuhoOnshiInconsistency[] = [];
  if (a.hokenshaBangou !== onshi.hokenshaBangou) {
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
  // if (a.validFrom !== onshi.validFrom) {
  //   diff.push("inconsistent-valid-from");
  // }
  // if (a.validUpto !== onshi.validUpto) {
  //   diff.push("inconsistent-valid-upto");
  // }
  if (a.honninStore !== onshi.honninStore) {
    diff.push("inconsistent-honnin-kazoku");
  }
  return diff;
}

function stripLeadingZero(s: string): string {
  return s.replace(/^[0０]+/, "");
}

export async function tryFixEdaban(shahokokuho: Shahokokuho, onshi: Shahokokuho, inconsistencies: ShahokokuhoOnshiInconsistency[]): Promise<boolean> {
  if (
    inconsistencies.length === 1 &&
    inconsistencies[0] === "inconsistent-edaban" &&
    shahokokuho.edaban === ""
  ) {
    shahokokuho.edaban = onshi.edaban;
    await api.updateShahokokuho(shahokokuho);
    return true;
  } else {
    return false;
  }
}

export type KoukikoureiOnshiInconsistency =
  "inconsistent-hokensha-bangou" |
  "inconsistent-hihokensha-bangou" |
  "inconsistent-futanwari" |
  "inconsistent-valid-from" |
  "inconsistent-valid-upto";

export function inconsistencyToMessage(inconsistency: ShahokokuhoOnshiInconsistency | KoukikoureiOnshiInconsistency): string {
  switch (inconsistency) {
    case "inconsistent-hokensha-bangou": return "保険者番号が一致しません。";
    case "inconsistent-hihokensha-kigou": return "被保険者記号が一致しません。";
    case "inconsistent-hihokensha-bangou": return "被保険者番号が一致しません。";
    case "inconsistent-edaban": return "枝番が一致しません。";
    case "inconsistent-honnin-kazoku": return "本人・家族が一致しません。";
    case "inconsistent-kourei": return "高齢受給割合が一致しません。";
    case "inconsistent-valid-from": return "期限開始が一致しません。";
    case "inconsistent-valid-upto": return "期限終了が一致しません。";
    case "inconsistent-futanwari": return "負担割合が一致しません。";
  }
}

export function checkKoukikoureiInconsistency(a: Koukikourei, onshi: Koukikourei): KoukikoureiOnshiInconsistency[] {
  const result: KoukikoureiOnshiInconsistency[] = [];
  if (toHankaku(stripLeadingZero(a.hokenshaBangou)) !== toHankaku(stripLeadingZero(onshi.hokenshaBangou))) {
    result.push("inconsistent-hokensha-bangou");
  }
  if (toHankaku(stripLeadingZero(a.hihokenshaBangou)) !== toHankaku(stripLeadingZero(onshi.hihokenshaBangou))) {
    result.push("inconsistent-hihokensha-bangou");
  }
  if (a.futanWari !== onshi.futanWari) {
    result.push("inconsistent-futanwari");
  }
  // if (a.validFrom !== onshi.validFrom) {
  //   result.push("inconsistent-valid-from");
  // }
  // if (a.validUpto !== onshi.validUpto) {
  //   result.push("inconsistent-valid-upto");
  // }
  return result;
}

export async function tryFixPrevHoken(prev: Shahokokuho | Koukikourei, onshi: Shahokokuho | Koukikourei): Promise<string[] | undefined> {
  if (prev instanceof Shahokokuho && onshi instanceof Shahokokuho) {
    const inconsistencies = checkShahokokuhoInconsistency(prev, onshi);
    if (inconsistencies.length === 0) {
      return undefined;
    }
    if (prev.hokenshaBangou === onshi.hokenshaBangou && prev.hihokenshaBangou === onshi.hihokenshaBangou &&
      prev.validFrom === onshi.validFrom) {
      return inconsistencies.map(inconsistencyToMessage);
    }
  }
  if (prev instanceof Koukikourei && onshi instanceof Koukikourei) {
    const inconsistencies = checkKoukikoureiInconsistency(prev, onshi);
    if (inconsistencies.length === 0) {
      return undefined;
    }
    if (prev.hokenshaBangou === onshi.hokenshaBangou && prev.hihokenshaBangou === onshi.hihokenshaBangou &&
      prev.validFrom === onshi.validFrom) {
      return inconsistencies.map(inconsistencyToMessage);
    }
  }
  if (prev instanceof Shahokokuho) {
    const err = await tryFixShahokokuhoValidUpto(prev, onshi.validFrom);
    if (err) {
      return ["以前の保険の有効期限を変更できませんでした。"]
    } else {
      return undefined;
    }
  } else {
    const err = await tryFixKoukikoureiValidUpto(prev, onshi.validFrom);
    if (err) {
      return ["以前の保険の有効期限を変更できませんでした。"]
    } else {
      return undefined;
    }
  }
}

async function tryFixShahokokuhoValidUpto(shahokokuho: Shahokokuho, otherStartDate: string)
  : Promise<string | undefined> {
  const shahokokuhoId = shahokokuho.shahokokuhoId;
  const visits = await api.shahokokuhoUsageSince(shahokokuhoId, otherStartDate);
  if (visits.length > 0) {
    return "失効している保険証の使用が" +
      visits.map(v => kanjidate.format(kanjidate.f2, v.visitedAt)).join("、") +
      "に確認されました。その旨を管理者に連絡してください。";
  } else {
    const at = dateToSqlDate(kanjidate.addDays(new Date(otherStartDate), -1));
    if (shahokokuho.validUpto === "0000-00-00" || shahokokuho.validUpto > at) {
      await api.updateShahokokuho(Object.assign({}, shahokokuho, { validUpto: at }))
    }
    return undefined;
  }
}

async function tryFixKoukikoureiValidUpto(koukikourei: Koukikourei, otherStartDate: string)
  : Promise<string | undefined> {
  const koukikoureiId = koukikourei.koukikoureiId;
  const visits = await api.koukikoureiUsageSince(koukikoureiId, otherStartDate);
  if (visits.length > 0) {
    return "失効している保険証の使用が" +
      visits.map(v => kanjidate.format(kanjidate.f2, v.visitedAt)).join("、") +
      "に確認されました。その旨を管理者に連絡してください。";
  } else {
    const at = dateToSqlDate(kanjidate.addDays(new Date(otherStartDate), -1));
    if (koukikourei.validUpto === "0000-00-00" || koukikourei.validUpto > at) {
      await api.updateKoukikourei(Object.assign({}, koukikourei, { validUpto: at }));
    }
    return undefined;
  }
}
