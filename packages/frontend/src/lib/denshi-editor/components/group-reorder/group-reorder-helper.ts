import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";

export function groupRep(group: RP剤情報): string {
  if( group.薬品情報グループ.length === 0 ){
    return "(no drug)";
  } else {
    return group.薬品情報グループ[0].薬品レコード.薬品名称;
  }
}