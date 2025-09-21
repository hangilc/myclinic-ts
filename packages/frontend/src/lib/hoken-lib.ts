import type { Koukikourei, Shahokokuho } from "myclinic-model";
import api from "./api";

export type TryUpdateHokenResult = "success" | "not-allowed" | "invalid-valid-upto";

export async function tryUpdateShahokokuho(shahokokuho: Shahokokuho): Promise<TryUpdateHokenResult> {
  const prev: Shahokokuho = await api.getShahokokuho(shahokokuho.shahokokuhoId);
  if (isEqualShahokokuho(prev, shahokokuho)) {
    return "success";
  }
  const usage: number = await api.countShahokokuhoUsage(shahokokuho.shahokokuhoId);
  if (usage > 0) {
    let cmp = Object.assign({}, prev, { validUpto: shahokokuho.validUpto });
    if( prev.edaban === "" || prev.edaban === undefined ){
      cmp.edaban = shahokokuho.edaban;
    }
    if (!isEqualShahokokuho(cmp, shahokokuho)) {
      return "not-allowed";
    }
    if (shahokokuho.validUpto !== "0000-00-00") {
      const u: number = await api.countShahokokuhoUsageAfter(shahokokuho.shahokokuhoId, shahokokuho.validUpto);
      if (u > 0) {
        return "invalid-valid-upto";
      }
    }
  }
  await api.updateShahokokuho(shahokokuho);
  return "success";
}

function isEqualShahokokuho(a: Shahokokuho, b: Shahokokuho): boolean {
  return a.shahokokuhoId === b.shahokokuhoId &&
    a.patientId === b.patientId &&
    a.hokenshaBangou === b.hokenshaBangou &&
    a.hihokenshaKigou === b.hihokenshaKigou &&
    a.hihokenshaBangou === b.hihokenshaBangou &&
    a.honninStore === b.honninStore &&
    a.validFrom === b.validFrom &&
    a.validUpto === b.validUpto &&
    a.koureiStore === b.koureiStore &&
    a.edaban === b.edaban;
}

export async function tryUpdateKoukikourei(koukikourei: Koukikourei): Promise<TryUpdateHokenResult> {
  const prev: Koukikourei = await api.getKoukikourei(koukikourei.koukikoureiId);
  if (isEqualKoukikourei(prev, koukikourei)) {
    return "success";
  }
  const usage: number = await api.countKoukikoureiUsage(koukikourei.koukikoureiId);
  if (usage > 0) {
    console.log("cmp", Object.assign({}, prev, koukikourei.validUpto), koukikourei);
    if (!isEqualKoukikourei(Object.assign({}, prev, { validUpto: koukikourei.validUpto }), koukikourei)) {
      return "not-allowed";
    }
    if (koukikourei.validUpto !== "0000-00-00") {
      const u: number = await api.countKoukikoureiUsageAfter(koukikourei.koukikoureiId, koukikourei.validUpto);
      if (u > 0) {
        return "invalid-valid-upto";
      }
    }
  }
  await api.updateKoukikourei(koukikourei);
  return "success";
}

function isEqualKoukikourei(a: Koukikourei, b: Koukikourei): boolean {
  return a.koukikoureiId === b.koukikoureiId &&
    a.patientId === b.patientId &&
    a.hokenshaBangou === b.hokenshaBangou &&
    a.hihokenshaBangou === b.hihokenshaBangou &&
    a.futanWari === b.futanWari &&
    a.validFrom === b.validFrom &&
    a.validUpto === b.validUpto
}

