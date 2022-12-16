import * as kanjidate from "kanjidate";
import type { Gengou } from "kanjidate";

export function lastDayOf(year: number, month: number): number {
  return kanjidate.lastDayOfMonth(year, month);
}

export function lastNenOf(gengou: Gengou): number {
  return kanjidate.nenRangeOf(gengou)[1];
}

export function composeDate(
  gengou: string,
  nen: number,
  month: number,
  day: number
): Date {
  let g = kanjidate.Gengou.fromString(gengou);
  if (g != null) {
    let lastNen: number = kanjidate.nenRangeOf(g)[1];
    nen = Math.min(nen, lastNen);
  }
  let year = kanjidate.fromGengou(gengou, nen);
  let lastDay: number = kanjidate.lastDayOfMonth(year, month);
  day = Math.min(day, lastDay);
  return new Date(year, month - 1, day);
}
