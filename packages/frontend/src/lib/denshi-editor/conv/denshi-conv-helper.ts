import type { 不均等レコード, 薬品レコード, 薬品情報, 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
import type { Drug, DrugGroup } from "@/lib/parse-shohou";
import { toHankaku } from "@/lib/zenkaku";
import type { IyakuhinMaster } from "myclinic-model";

export type 薬品情報Partial1 = Omit<薬品情報, "薬品レコード">;
export type 薬品情報Partial2 = Omit<薬品情報, keyof 薬品情報Partial1>;
export type 薬品レコードPartial1 = Omit<薬品レコード, "情報区分" | "薬品コード種別" | "薬品コード" | "薬品名称" | "単位名">;
export type 薬品レコードPartial2 = Omit<薬品レコード, keyof 薬品レコードPartial1>;

export function convDrugToDenshi(info1: 薬品情報Partial1, info2: 薬品情報Partial2): 薬品情報 {
  return Object.assign({}, info1, info2);
}

export function convShohouDrugTo薬品情報Partial1(drug: Drug): 薬品情報Partial1 {
  return {
    不均等レコード: get不均等レコード(drug),
    薬品補足レコード: get薬品補足レコード(drug),
  }
}

export function convShohouDrugTo薬品レコードPartial1(drug: Drug): 薬品レコードPartial1 {
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

function get不均等レコード(drug: Drug): 不均等レコード | undefined {
  if (drug.uneven) {
    let uneven = drug.uneven;
    uneven = uneven.replace(/^\s*[(（]/, "");
    uneven = uneven.replace(/[)）]\s*$/, "");
    let sep = /\s*[-ー－]\s*/;
    const unevenParts = uneven.split(sep);
    if (unevenParts.length >= 2) {
      const 不均等レコード: 不均等レコード = {
        不均等１回目服用量: toHankaku(unevenParts[0]),
        不均等２回目服用量: toHankaku(unevenParts[1]),
        不均等３回目服用量: unevenParts[2]
          ? toHankaku(unevenParts[2].trim())
          : undefined,
        不均等４回目服用量: unevenParts[3]
          ? toHankaku(unevenParts[3].trim())
          : undefined,
        不均等５回目服用量: unevenParts[4]
          ? toHankaku(unevenParts[4].trim())
          : undefined,
      };
      return 不均等レコード;
    } else throw new Error("uneven record has less than two parts.");
  } else {
    return undefined;
  }
}

function get薬品補足レコード(drug: Drug): 薬品補足レコード[] | undefined {
  let recs: 薬品補足レコード[] = [];
  if (drug.senpatsu) {
    switch (drug.senpatsu) {
      case "henkoufuka":
        recs.push({ 薬品補足情報: "後発品変更不可" });;
        break;
      case "kanjakibou":
        recs.push({ 薬品補足情報: "先発医薬品患者希望" });
        break;
      default:
        throw new Error(`Unknown senpatsu type: ${drug.senpatsu}`);
    }
  }
  for (const comment of drug.drugComments) {
    recs.push({ 薬品補足情報: comment })
  }
  return recs.length === 0 ? undefined : recs;
}
