import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
import type { Text, Visit } from "myclinic-model/model";
import { DateWrapper } from "myclinic-util";
import { textToDrugGroups } from "./helper";

export interface PrescSearchItem {
  title: string;
  drugs: RP剤情報[];
  isEditing: boolean;
}

export function textToPrescSearchItem(text: Text, visit: Visit): PrescSearchItem {
  let title = DateWrapper.fromSqlDate(visit.visitedAt).render(d => 
    `${d.gengou}${d.nen}年${d.month}月${d.day}日`
  )
  let drugs = textToDrugGroups(text);
  return {
    title,
    drugs,
    isEditing: false,
  }
}