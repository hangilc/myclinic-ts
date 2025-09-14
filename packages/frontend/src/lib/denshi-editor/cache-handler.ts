import { cache } from "../cache";

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
    let bind = { kind, code: drugCode, name: drugName }
    if (this.origDrugCode === "") {
      map[this.origDrugName] = bind;
    } else {
      const origCode = this.origDrugCode;
      for (let k in map) {
        let v = map[k];
        if( v.kind === kind && v.code === origCode ){
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