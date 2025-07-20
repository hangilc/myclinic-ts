import { cache } from "../cache";
import type { 薬品レコード } from "../denshi-shohou/presc-info";
import type { RP剤情報Edit, 薬品情報Edit } from "./denshi-edit";

export class DrugCacheHandler {
  origDrugName: string;
  origDrugCode: string;
  origDrugUnit: string;

  constructor(origDrugName: string, origDrugCode: string, origDrugUnit: string) {
    this.origDrugName = origDrugName;
    this.origDrugCode = origDrugCode;
    this.origDrugUnit = origDrugUnit;
  }

  async handle(drugName: string, drugCode: string, kind: "iyakuhin" | "kizai" | "ippanmei"): Promise<void> {
    if (this.origDrugCode === drugCode) {
      return;
    }
    let map = await cache.getDrugNameIyakuhincodeMap();
    let bind: number
      | { kind: "ippanmei"; name: string; code: string }
      | { kind: "kizai"; kizaicode: number };
    if (kind === "iyakuhin") {
      let code = parseInt(drugCode);
      if (isNaN(code)) {
        throw new Error(`invalid iyakuhincode: ${drugCode}`);
      }
      bind = code;
    } else if (kind === "kizai") {
      let code = parseInt(drugCode);
      if (isNaN(code)) {
        throw new Error(`invalid iyakuhincode: ${drugCode}`);
      }
      bind = { "kind": "kizai", "kizaicode": code };
    } else if (kind === "ippanmei") {
      bind = { "kind": "ippanmei", name: drugName, code: drugCode };
    } else {
      throw new Error("cannot happen");
    }
    if (this.origDrugCode === "") {
      map[this.origDrugName] = bind;
    } else {
      const origCode = this.origDrugCode;
      for (let k in map) {
        let v = map[k];
        let replace = false;
        if (typeof v === "number") {
          replace = v.toString() === origCode;
        } else if (v.kind === "ippanmei") {
          replace = v.code === origCode;
        } else {
          replace = v.kizaicode.toString() === origCode;
        }
        if (replace) {
          map[k] = bind;
        }
      }
    }
    await cache.setDrugNameIyakuhincodeMap(map);
  }
}

export class UsageCacheHandler {
  origUsageName: string;
  origUsageCode: string;

  constructor(origUsageName: string, origUsageCode: string) {
    this.origUsageName = origUsageName;
    this.origUsageCode = origUsageCode;
  }

  async handle(usageName: string, usageCode: string): Promise<void> {
    if (this.origUsageCode === usageCode) {
      return;
    }
    let map = await cache.getUsageMasterMap();
    let resolved = { 用法コード: usageCode, 用法名称: usageName };
    map[this.origUsageName] = resolved;
    await cache.setUsageMasterMap(map);
  }
}