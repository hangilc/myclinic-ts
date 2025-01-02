import { FormatDate } from "myclinic-util";


export function endDateRep(date: Date | undefined): string {
  if (date == null) {
    return "未終了";
  } else {
    return FormatDate.f3(date);
  }
}
