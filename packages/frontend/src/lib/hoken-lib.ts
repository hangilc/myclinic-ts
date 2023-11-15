import type { Shahokokuho } from "myclinic-model";
import api from "./api";

export type TryUpdateShahokokuhoResult = "success" | "not-allowed" | "invalid-valid-upto";
export async function tryUpdateShahokokuho(shahokokuho: Shahokokuho): Promise<TryUpdateShahokokuhoResult> {
  const prev: Shahokokuho = await api.getShahokokuho(shahokokuho.shahokokuhoId);
  if (isEqualShahokokuho(prev, shahokokuho)) {
    return "success";
  }
  const usage: number = await api.countShahokokuhoUsage(shahokokuho.shahokokuhoId);
  if (usage > 0) {
    if (!isEqualShahokokuho(Object.assign({}, prev, shahokokuho.validUpto), shahokokuho)) {
      return "not-allowed";
    }
    if( shahokokuho.validUpto !== "0000-00-00" ){
      const u: number = await api.countShahokokuhoUsageAfter(shahokokuho.shahokokuhoId, shahokokuho.validUpto);
      if( u > 0 ){
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