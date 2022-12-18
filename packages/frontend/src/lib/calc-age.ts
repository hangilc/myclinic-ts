import * as kanjidate from "kanjidate";
import { dateParam } from "./date-param";
import { toDate } from "./to-date";

export function calcAge(dayOfBirth: Date | string, at: Date = new Date()): number {
  let dob = toDate(dayOfBirth)
  return kanjidate.calcAge(dob, at);
}