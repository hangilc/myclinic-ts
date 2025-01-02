import { FormatDate } from "myclinic-util";


export function startDateRep(date: Date): string {
  return FormatDate.f3(date);
}
