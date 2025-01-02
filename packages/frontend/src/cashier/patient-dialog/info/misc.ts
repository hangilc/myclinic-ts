import { FormatDate } from "myclinic-util";

export function formatValidFrom(sqldate: string): string {
  return FormatDate.f2(sqldate);
}

export function formatValidUpto(sqldate: string): string {
  if (sqldate === "0000-00-00") {
    return "（期限なし）";
  } else {
    return FormatDate.f2(sqldate);
  }
}

