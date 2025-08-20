import { toZenkaku } from "@/lib/zenkaku";
import type { RP剤情報, 不均等レコード, 用法レコード, 用法補足レコード, 薬品レコード, 薬品情報, 負担区分レコード } from "../presc-info";
import { drugKouhiRep } from "@/lib/denshi-helper";

export function amountDisp(rec: 薬品レコード): string {
  return `${toZenkaku(rec.分量)}${toZenkaku(rec.単位名)}`;
}

export function drugDisp(drug: 薬品情報): string {
  const name = drug.薬品レコード.薬品名称;
  const amount = amountDisp(drug.薬品レコード);
  let disp = `${name} ${amount}`;
  if (drug.不均等レコード) {
    disp += ` (${unevenDisp(drug.不均等レコード)})`;
  }
  if (drug.負担区分レコード) {
    disp += ` ${futanKubunDisp(drug.負担区分レコード)}`;
  }
  if (drug.薬品補足レコード) {
    disp += ` ${drug.薬品補足レコード.map(rec => rec.薬品補足情報).join(" ")}`;
  }
  return disp;
}

export function futanKubunDisp(rec: 負担区分レコード): string {
  const s = drugKouhiRep(rec);
  if( s === "" ){
    return "";
  } else {
    return `「${s}」`;
  }
}

// export function futanKubunDisp(rec: 負担区分レコード): string {
//   const s = [
//     rec.第一公費負担区分 ? "第一公費" : "",
//     rec.第二公費負担区分 ? "第二公費" : "",
//     rec.第三公費負担区分 ? "第三公費" : "",
//     rec.特殊公費負担区分 ? "特殊公費" : "",
//   ].filter(s => s !== "").join("・");
//   if( s === "" ){
//     return "";
//   } else {
//     return `「${s}」`;
//   }
// }

export function usageDisp(group: { 用法レコード: 用法レコード; 用法補足レコード?: 用法補足レコード[]; }): string {
  let s = group.用法レコード.用法名称;
  if (group.用法補足レコード) {
    group.用法補足レコード.forEach(rec => {
      // let kubunRep = "";
      // let kubun = rec.用法補足区分;
      // if (kubun !== "用法の続き" && kubun !== "JAMI部位" && kubun !== "JAMI補足用法" && kubun !== "一包化") {
      //   kubunRep = `（${kubun}）`;
      // }
      s += ` （${rec.用法補足情報}）`;
    })
  }
  return s;
}

export function daysTimesDisp(group: RP剤情報): string {
  const num = group.剤形レコード.調剤数量
  const rep = toZenkaku(num.toString());
  if (group.剤形レコード.剤形区分 === "内服") {
    return `${rep}日分`;
  } else if (group.剤形レコード.剤形区分 === "頓服") {
    return `${rep}回分`;
  } else {
    return "";
  }
}

export function unevenDisp(rec: 不均等レコード): string {
  const s = [
    rec?.不均等１回目服用量,
    rec?.不均等２回目服用量,
    rec?.不均等３回目服用量 ?? "",
    rec?.不均等４回目服用量 ?? "",
    rec?.不均等５回目服用量 ?? "",
  ]
    .filter((s) => s !== "")
    .join("-");
  return toZenkaku(s);
}
