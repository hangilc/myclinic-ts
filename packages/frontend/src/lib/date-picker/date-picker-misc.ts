import { lastDayOfMonth, nameToGengou, nenRangeOfGengou, warekiToYear, type Gengou } from "myclinic-util";

export function lastDayOf(year: number, month: number): number {
  return lastDayOfMonth(year, month);
}

export function lastNenOf(gengou: Gengou): number {
  return nenRangeOfGengou(gengou)[1];
}

export function composeDate(
  gengou: string,
  nen: number,
  month: number,
  day: number
): Date {
  let g = nameToGengou(gengou);
  if (g != null) {
    let lastNen: number = nenRangeOfGengou(g)[1];
    nen = Math.min(nen, lastNen);
  } else {
    throw new Error(`invalid gengou: ${gengou}`)
  }
  let year = warekiToYear(g, nen);
  let lastDay: number = lastDayOfMonth(year, month);
  day = Math.min(day, lastDay);
  return new Date(year, month - 1, day);
}
