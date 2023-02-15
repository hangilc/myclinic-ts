import * as kanjidate from "kanjidate"

export function rangeOfWeek(anchor: Date): [Date, Date] {
  const start = kanjidate.firstDayOfWeek(anchor);
  const last = kanjidate.addDays(start, 6);
  return [start, last];
}
