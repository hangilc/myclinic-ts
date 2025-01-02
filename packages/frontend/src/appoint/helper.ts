import { FormatDate } from "myclinic-util";

export function formatDate(date: string): string {
  // return kanjidate.format("{M}月{D}日（{W}）", date);
  return FormatDate.monthDayWeek(date);
}
