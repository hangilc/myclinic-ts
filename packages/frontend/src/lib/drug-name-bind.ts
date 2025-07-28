import type { PrescInfoData, RP剤情報, 用法レコード, 薬品レコード } from "@/lib/denshi-shohou/presc-info";
import type {
  情報区分,
  薬品コード種別,
  力価フラグ,
} from "@/lib/denshi-shohou/denshi-shohou";
import { cache } from "@/lib/cache";
import { confirmDrugCode } from "@/lib/denshi-editor/helper";

export type DrugNameBind = { kind: "iyakuhin" | "ippanmei" | "kizai" } & {
  code: string;
  name: string;
};

export function resolveDrugRecordByMap(drug: 薬品レコード, map: Record<string, DrugNameBind>): 薬品レコード {
  if (drug.薬品コード === "") {
    const bind = map[drug.薬品名称];
    if (bind) {
      const record = Object.assign({}, drug, {
        薬品名称: bind.name,
        薬品コード: bind.code,
      });
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
      return record;
    }
  }
  return drug;
}

export async function resolveDrugRecordByMapAt(record: 薬品レコード, at: string): Promise<薬品レコード> {
  const save: 薬品レコード = Object.assign({}, record);
  if( record.薬品コード === "" ){
    let map = await cache.getDrugNameIyakuhincodeMap();
    record = resolveDrugRecordByMap(record, map);
  }
  if( record.薬品コード === "" ){
    return save;
  } else {
    const err = await confirmDrugCode(record, at);
    return err ? save : record;
  }
}

export function resolveDrugGroupByMap(g: RP剤情報, map: Record<string, DrugNameBind>): void {
  for (let d of g.薬品情報グループ) {
    if (d.薬品レコード.薬品コード === "") {
      let record = d.薬品レコード;
      let bind = map[record.薬品名称];
      if (bind) {
        record.薬品名称 = bind.name;
        record.薬品コード = bind.code;
        if (bind.kind === "iyakuhin") {
          record.薬品コード種別 = "レセプト電算処理システム用コード";
          record.情報区分 = "医薬品";
          if (g.剤形レコード.剤形区分 === "医療材料") {
            g.剤形レコード.剤形区分 = "不明";
          }
        } else if (bind.kind === "ippanmei") {
          record.薬品コード種別 = "一般名コード";
          record.情報区分 = "医薬品";
          if (g.剤形レコード.剤形区分 === "医療材料") {
            g.剤形レコード.剤形区分 = "不明";
          }
        } else if (bind.kind === "kizai") {
          record.薬品コード種別 = "レセプト電算処理システム用コード";
          record.情報区分 = "医療材料";
          g.剤形レコード.剤形区分 = "医療材料";
        }
      }
    }
  }
}

export async function resolveUsageRecordByMap(
  usage: 用法レコード
): Promise<void> {
  let map = await cache.getUsageMasterMap();
  if (usage.用法コード === "") {
    let bind = map[usage.用法名称];
    if (bind) {
      Object.assign(usage, bind);
    }
  }
}
