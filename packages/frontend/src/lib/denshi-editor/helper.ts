import type { 薬品レコード } from "@/lib//denshi-shohou/presc-info";

export function validateDrug(drug: 薬品レコード): string | undefined {
  if( drug.薬品コード === "" ){
    return "薬品コードが設定されていません。";
  }
  if( drug.薬品名称 === "" ){
    return "薬品名称が設定されていません。";
  }
  if( drug.分量 === "" ){
    return "分量が設定されていません。";
  } else {
    const amount = drug.分量;
    const n = parseFloat(amount);
    if( isNaN(n) ){
      return "分量が数値でありません。";
    }
  }
  if( drug.単位名 === "" ){
    return "単位名が設定されていません。";
  }
  return undefined;
}
