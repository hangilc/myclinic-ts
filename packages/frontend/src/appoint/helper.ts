import * as kanjidate from "kanjidate";

export function formatDate(date: string): string {
  return kanjidate.format("{M}月{D}日（{W}）", date);
}
