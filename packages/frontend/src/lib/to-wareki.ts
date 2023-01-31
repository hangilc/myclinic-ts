import { dateToSql, parseSqlDate } from "./util";
import { KanjiDate } from "kanjidate";

export function toWareki(date: Date | string): [string, number] {
  if( typeof date === "string" ){
    date = parseSqlDate(date);
  }
  const k = new KanjiDate(date);
  return [k.gengou, k.nen];
}