import type { 用法レコード, 薬品レコード } from "@/lib/denshi-shohou/presc-info";
import type { DrugNameBind } from "./drug-name-bind";

export function resolveDrugRecordByMap(record: 薬品レコード, map: Record<string, DrugNameBind>): 薬品レコード {
  let bind = map[record.薬品名称];
  if (bind) {
    record = Object.assign({}, record);
    record.薬品名称 = bind.name;
    record.薬品コード = bind.code;
    if (bind.kind === "iyakuhin") {
      record.薬品コード種別 = "レセプト電算処理システム用コード";
      record.情報区分 = "医薬品";
      if (g.剤形レコード.剤形区分 === "医療材料") {
        g.剤形レコード.剤形区分 = "不明"
      }
    } else if (bind.kind === "ippanmei") {
      record.薬品コード種別 = "一般名コード";
      record.情報区分 = "医薬品";
      if (g.剤形レコード.剤形区分 === "医療材料") {
        g.剤形レコード.剤形区分 = "不明"
      }
    } else if (bind.kind === "kizai") {
      record.薬品コード種別 = "レセプト電算処理システム用コード";
      record.情報区分 = "医療材料";
      g.剤形レコード.剤形区分 = "医療材料";
    }
  }
  return record;
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

