import type { 不均等レコード, 薬品レコード, 薬品情報, 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
import type { 力価フラグ, 情報区分, 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";
import { toZenkaku } from "@/lib/zenkaku";
import { 不均等レコードWrapper } from "../denshi-shohou/denshi-type-wrappers";

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

export function runner(...fs: (() => any)[]): () => void {
  return () => {
    for (let f of fs) {
      f();
    }
  }
}
