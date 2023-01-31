import { KanjiDate } from "kanjidate";
import { parseSqlDate } from "./util";

export function toKanjiDate(date: Date | string): KanjiDate {
  if( typeof date === "string" ){
    date = parseSqlDate(date);
  }
  return new KanjiDate(date);
}
