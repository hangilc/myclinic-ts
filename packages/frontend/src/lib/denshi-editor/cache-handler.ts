import { cache } from "../cache";
import type { 薬品レコード } from "../denshi-shohou/presc-info";
import type { RP剤情報Edit, 薬品情報Edit } from "./denshi-edit";

export class DrugCacheHandler {
  origDrugName: string;
  origDrugCode: string;

  constructor(origDrugName: string, origDrugCode: string) {
    this.origDrugName = origDrugName;
    this.origDrugCode = origDrugCode;
  }

  async handle(drugName: string, drugCode: string, kind: "iyakuhin" | "kizai" | "ippanmei"): Promise<void> {
    if (this.origDrugCode === drugCode) {
      return;
    }
    let map = await cache.getDrugNameIyakuhincodeMap();
    if (kind === "iyakuhin") {
      let code = parseInt(drugCode);
      if (isNaN(code)) {
        throw new Error(`invalid iyakuhincode: ${drugCode}`);
      }
      map[this.origDrugName] = code;
    } else if (kind === "kizai") {
      let code = parseInt(drugCode);
      if (isNaN(code)) {
        throw new Error(`invalid iyakuhincode: ${drugCode}`);
      }
      map[this.origDrugName] = { "kind": "kizai", "kizaicode": code };
    } else if (kind === "ippanmei") {
      map[this.origDrugName] = { "kind": "ippanmei", name: drugName, code: drugCode };
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