import type { 薬品レコード, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import type { Drug } from "@/lib/parse-shohou";
import { toHankaku } from "@/lib/zenkaku";
import type { IyakuhinMaster } from "myclinic-model";

export type 薬品情報Partial1 = Omit<薬品情報, "薬品レコード">;
export type 薬品情報Partial2 = Omit<薬品情報, keyof 薬品情報Partial1>;
export type 薬品レコードPartial1 = Omit<薬品レコード, "情報区分" | "薬品コード種別" | "薬品コード" | "薬品名称" | "単位名">;
export type 薬品レコードPartial2 = Omit<薬品レコード, keyof 薬品レコードPartial1>;

export function convDrugToDenshi(info1: 薬品情報Partial1, info2: 薬品情報Partial2): 薬品情報 {
  return Object.assign({}, info1, info2);
}

export function convShohouDrugToPartial(drug: Drug): 薬品レコードPartial1 {
  if (isNaN(Number(toHankaku(drug.amount)))) {
    throw new Error(`薬品の分量が数値でありません：${drug.amount}`);
  }
  return {
    分量: drug.amount,
    力価フラグ: "薬価単位",
  };
}

export function createPartial2FromIyakuhinMaster(m: IyakuhinMaster, applyIppanmei: boolean): 薬品レコードPartial2 {
  let rec = {
    情報区分: "医薬品" as const,
    単位名: m.unit,
  }
  if (applyIppanmei && m.ippanmei && m.ippanmeicode) {
    return Object.assign(rec, {
      薬品コード種別: "レセプト電算処理システム用コード" as const,
      薬品コード: m.iyakuhincode.toString(),
      薬品名称: m.name,
    });
  } else {
    return Object.assign(rec, {
      薬品コード種別: "一般名コード" as const,
      薬品コード: m.ippanmeicode.toString(),
      薬品名称: m.ippanmei,
    });
  };
}