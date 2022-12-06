import * as kanjidate from "kanjidate";

export function formatValidFrom(sqldate: string): string {
  return kanjidate.format(kanjidate.f2, sqldate);
}

export function formatValidUpto(sqldate: string): string {
  if (sqldate === "0000-00-00") {
    return "（期限なし）";
  } else {
    return kanjidate.format(kanjidate.f2, sqldate);
  }
}

