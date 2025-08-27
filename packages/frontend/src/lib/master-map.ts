import type { PrescInfoData, RP剤情報, 用法レコード, 薬品レコード, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import type { DrugNameBind } from "./drug-name-bind";
import { cache } from "./cache";
import { confirmDrugCode } from "./validate-presc-info";

export function resolveDrugRecordByMap(record: 薬品レコード, map: Record<string, DrugNameBind>): 薬品レコード {
  let bind = map[record.薬品名称];
  if (bind) {
    record = Object.assign({}, record);
    record.薬品名称 = bind.name;
    record.薬品コード = bind.code;
    if (bind.kind === "iyakuhin") {
      record.薬品コード種別 = "レセプト電算処理システム用コード";
      record.情報区分 = "医薬品";
    } else if (bind.kind === "ippanmei") {
      record.薬品コード種別 = "一般名コード";
      record.情報区分 = "医薬品";
    } else if (bind.kind === "kizai") {
      record.薬品コード種別 = "レセプト電算処理システム用コード";
      record.情報区分 = "医療材料";
    }
  }
  return record;
}

export async function resolveDrugRecordByMapAt(record: 薬品レコード, at: string): Promise<薬品レコード> {
  if( record.薬品コード === "" ){
    let map = await cache.getDrugNameIyakuhincodeMap();
    record = await resolveDrugRecordByMap(record, map);
  }
  if( record.薬品コード !== "" ){
    let err = await confirmDrugCode(record, at);
    if( err ){
      return Object.assign({}, record, { 薬品コード: "" })
    } else {
      return record;
    }
  } else {
    return record;
  }
}

export function resolveUsageRecordByMap(usage: 用法レコード, map: Record<string, 用法レコード>): 用法レコード {
  if (usage.用法コード === "") {
    let bind = map[usage.用法名称];
    if (bind) {
      usage = Object.assign(usage, bind);
    }
  }
  return usage;
}

export async function resolveGroupByMapAt(group: RP剤情報, at: string): Promise<RP剤情報> {
  const drugs: 薬品情報[] = [];
  for(let drug of group.薬品情報グループ){
    let record = await resolveDrugRecordByMapAt(drug.薬品レコード, at);
    drugs.push(Object.assign({}, drug, { 薬品レコード: record }));
  }
  const usageMap = await cache.getUsageMasterMap();
  const usage: 用法レコード = resolveUsageRecordByMap(group.用法レコード, usageMap);

  return Object.assign({}, group, {
    薬品情報グループ: drugs,
    用法レコード: usage,
  })
}

export async function resolvePrescInfoByMapAt(data: PrescInfoData, at: string): Promise<PrescInfoData> {
  const groups: RP剤情報[] = [];
  for(let group of data.RP剤情報グループ){
    const resolved = await resolveGroupByMapAt(group, at);
    groups.push(resolved);
  }
  return Object.assign({}, data, { RP剤情報グループ: groups })
}

