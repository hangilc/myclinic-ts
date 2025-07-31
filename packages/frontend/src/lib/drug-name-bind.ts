import type { PrescInfoData, RP剤情報, 用法レコード, 薬品レコード } from "@/lib/denshi-shohou/presc-info";
import type {
  情報区分,
  薬品コード種別,
  力価フラグ,
} from "@/lib/denshi-shohou/denshi-shohou";
import { cache } from "@/lib/cache";
import { confirmDrugCode } from "@/lib/validate-presc-info";

export type DrugNameBind = { kind: "iyakuhin" | "ippanmei" | "kizai" } & {
  code: string;
  name: string;
};

export function resolveDrugRecordByMap(drug: 薬品レコード, map: Record<string, DrugNameBind>): void {
  if (drug.薬品コード === "") {
    const bind = map[drug.薬品名称];
    if (bind) {
      drug.薬品名称 = bind.name;
      drug.薬品コード = bind.code;
      if (bind.kind === "iyakuhin") {
        drug.薬品コード種別 = "レセプト電算処理システム用コード";
        drug.情報区分 = "医薬品";
      } else if (bind.kind === "ippanmei") {
        drug.薬品コード種別 = "一般名コード";
        drug.情報区分 = "医薬品";
      } else if (bind.kind === "kizai") {
        drug.薬品コード種別 = "レセプト電算処理システム用コード";
        drug.情報区分 = "医療材料";
      }
    }
  }
}

export async function resolveDrugRecordByMapAt(record: 薬品レコード, at: string) {
  if (record.薬品コード === "") {
    let map = await cache.getDrugNameIyakuhincodeMap();
    resolveDrugRecordByMap(record, map);
  }
  if (record.薬品コード !== "") {
    const err = await confirmDrugCode(record, at);
    if( err ){
      record.薬品コード = "";
    }
  }
}

export function resolveDrugGroupByMap(g: RP剤情報, drugMap: Record<string, DrugNameBind>,
  usageMap: Record<string, 用法レコード>
): void {
  for (let d of g.薬品情報グループ) {
    if (d.薬品レコード.薬品コード === "") {
      let record = d.薬品レコード;
      resolveDrugRecordByMap(record, drugMap);
    }
  }
  resolveUsageRecordByMap(g.用法レコード, usageMap);
}

export async function resolveDrugGroupByMapAt(g: RP剤情報, at: string) {
  const usageMap = await cache.getUsageMasterMap();
  for (let d of g.薬品情報グループ) {
    if (d.薬品レコード.薬品コード === "") {
      let record = d.薬品レコード;
      resolveDrugRecordByMapAt(record, at);
    }
  }
  resolveUsageRecordByMap(g.用法レコード, usageMap);
}

export async function resolveUsageRecordByMap(
  usage: 用法レコード,
  map: Record<string, 用法レコード>
): Promise<void> {
  if (usage.用法コード === "") {
    let bind = map[usage.用法名称];
    if (bind) {
      Object.assign(usage, bind);
    }
  }
}
