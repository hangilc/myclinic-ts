import * as kanjidate from "kanjidate";

export function startDateRep(date: Date): string {
  return kanjidate.format(kanjidate.f3, date);
}
