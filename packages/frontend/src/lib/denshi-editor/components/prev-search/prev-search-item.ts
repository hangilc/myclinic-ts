import type { Text, Visit } from "myclinic-model/model";
import { DateWrapper } from "myclinic-util";
import { textToDrugGroups } from "./helper";
import { RP剤情報Edit } from "../../denshi-edit";

export interface PrevSearchItem {
  title: string;
  groups: RP剤情報Edit[];
  isEditing: boolean;
}

export function textToPrevSearchItem(text: Text, visit: Visit): PrevSearchItem {
  let title = DateWrapper.fromSqlDate(visit.visitedAt).render(d => 
    `${d.gengou}${d.nen}年${d.month}月${d.day}日`
  )
  let groups = textToDrugGroups(text).map(g => RP剤情報Edit.fromObject(g));
  return {
    title,
    groups: groups,
    isEditing: false,
  }
}