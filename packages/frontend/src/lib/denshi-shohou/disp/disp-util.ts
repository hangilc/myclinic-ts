import { toZenkaku } from "myclinic-rezept/zenkaku";
import type { RP剤情報, 薬品レコード } from "../presc-info";

export function amountDisp(rec: 薬品レコード): string {
  return `${toZenkaku(rec.分量)}${toZenkaku(rec.単位名)}`;
}

export function usageDisp(group: RP剤情報): string {
  return group.用法レコード.用法名称;
}

export function daysTimesDisp(group: RP剤情報): string {
  const num = group.剤形レコード.調剤数量
  const rep = toZenkaku(num.toString());
  if( group.剤形レコード.剤形区分 === "内服" ){
    return `${rep}日分`;
  } else if( group.剤形レコード.剤形区分 === "頓服" ){
    return `${rep}回分`;
  } else {
    return "";
  }
}
