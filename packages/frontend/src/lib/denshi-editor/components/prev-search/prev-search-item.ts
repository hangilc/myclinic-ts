import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
import type { Text, Visit } from "myclinic-model/model";
import { DateWrapper } from "myclinic-util";
import { textToDrugGroups } from "./helper";

export interface PrevSearchItem {
  title: string;
  groups: RP剤情報[];
  isEditing: boolean;
}

export function textToPrevSearchItem(text: Text, visit: Visit): PrevSearchItem {
  let title = DateWrapper.fromSqlDate(visit.visitedAt).render(d => 
    `${d.gengou}${d.nen}年${d.month}月${d.day}日`
  )
  let groups = textToDrugGroups(text);
  return {
    title,
    groups: groups,
    isEditing: false,
  }
}