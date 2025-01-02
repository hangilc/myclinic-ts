import { calcAge as utilCalcAge } from "myclinic-util";
import { toDate } from "./to-date";


export function calcAge(dayOfBirth: Date | string, at: Date | string = new Date()): number {
  return utilCalcAge(dayOfBirth, toDate(at));
}