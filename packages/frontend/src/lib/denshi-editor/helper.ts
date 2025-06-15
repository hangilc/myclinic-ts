import type { 薬品レコード } from "@/lib//denshi-shohou/presc-info";
import type { 力価フラグ, 情報区分, 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";

export function validateDrug(drug: {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  分量: string;
  力価フラグ: 力価フラグ;
  単位名: string | undefined;
}): 薬品レコード | string {
  if( drug.薬品コード === "" ){
    return "薬品コードが設定されていません。";
  }
  if( drug.薬品名称 === "" ){
    return "薬品名称が設定されていません。";
  }
  if( drug.分量 === "" ){
    return "分量が設定されていません。";
  } else {
    const n = parseFloat(drug.分量);
    if( isNaN(n) ){
      return "分量が数値でありません。";
    }
  }
  if( drug.単位名 === undefined ){
    return "単位名が設定されていません。";
  }
  return Object.assign({}, drug, { 単位名: drug.単位名 });
}



