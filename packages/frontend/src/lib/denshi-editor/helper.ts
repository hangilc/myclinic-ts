import type { RP剤情報, 不均等レコード, 剤形レコード, 用法レコード, 薬品レコード, 薬品情報, 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
import type { 力価フラグ, 情報区分, 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";
import { toZenkaku } from "@/lib/zenkaku";
import { 不均等レコードWrapper } from "../denshi-shohou/denshi-type-wrappers";
import type { Drug, DrugGroup, Usage } from "@/lib/parse-shohou";
import type { ConvData2 } from "./conv/denshi-conv";

export function validateDrug(drug: {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  分量: string;
  力価フラグ: 力価フラグ;
  単位名: string | undefined;
}): 薬品レコード | string {
  if (drug.薬品コード === "") {
    return "薬品コードが設定されていません。";
  } if (drug.薬品名称 === "") {
    return "薬品名称が設定されていません。";
  }
  if (drug.分量 === "") {
    return "分量が設定されていません。";
  } else {
    const n = parseFloat(drug.分量);
    if (isNaN(n)) {
      return "分量が数値でありません。";
    }
  }
  if (drug.単位名 === undefined) {
    return "単位名が設定されていません。";
  }
  return Object.assign({}, drug, { 単位名: drug.単位名 });
}

function unevenRep(u: 不均等レコード | undefined): string {
  if (u) {
    let wrapper = new 不均等レコードWrapper(u);
    return "(" + wrapper.getParts().join("-") + ")"
  } else {
    return "";
  }
}

function hosokuRep(h: 薬品補足レコード[] | undefined) {
  if (h) {
    return h.map(e => `　${e.薬品補足情報}`).join("");
  } else {
    return "";
  }
}

export function drugRep(drug: 薬品情報): string {
  return `${drug.薬品レコード.薬品名称}　${toZenkaku(
    drug.薬品レコード.分量,
  )}${drug.薬品レコード.単位名}${unevenRep(drug.不均等レコード)}${hosokuRep(drug.薬品補足レコード)}`;
}

export function unconvDrugRep(drug: Drug): string {
  let s = `${drug.name}　${drug.amount}${drug.unit}${drug.uneven ?? ""}`;
  if (drug.drugComments.length > 0) {
    for (let c of drug.drugComments) {
      s += `　${c}`;
    }
  }
  return s;
}

export function usageRep(usage: 用法レコード, data2: ConvData2): string {
  let s = usage.用法名称;
  if( data2.用法補足レコード && data2.用法補足レコード.length > 0){
    for(let rec of data2.用法補足レコード){
      s += `　${rec.用法補足情報}`
    }
  }
  return s;
}

export function unconvUsageRep(usage: Usage, data2: ConvData2): string {
  let s = usage.usage;
  if( data2.用法補足レコード && data2.用法補足レコード.length > 0){
    for(let rec of data2.用法補足レコード){
      s += `　${rec.用法補足情報}`
    }
  }
  return s;
}


export function runner(...fs: (() => any)[]): () => void {
  return () => {
    for (let f of fs) {
      f();
    }
  }
}
