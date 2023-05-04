import * as kanjidate from "kanjidate";

export function endDateRep(date: Date | undefined): string {
  if (date == null) {
    return "未終了";
  } else {
    return kanjidate.format(kanjidate.f3, date);
  }
}
