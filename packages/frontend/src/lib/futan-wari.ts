import { Koukikourei, Shahokokuho } from "myclinic-model";
import { DateWrapper, type DateWrapperLike, cmpNumSeq } from "myclinic-util";

export function futanWariOfHoken(hoken: Shahokokuho | Koukikourei): number {
  if (hoken instanceof Shahokokuho) {
    return hoken.koureiStore > 0 ? hoken.koureiStore : 3;
  } else {
    return hoken.futanWari;
  }
}

export function resolveFutanWari(hoken: Shahokokuho | Koukikourei, testUnder6: () => boolean): number {
  if (hoken instanceof Shahokokuho) {
    if (hoken.koureiStore > 0) {
      return hoken.koureiStore;
    } else {
      return testUnder6() ? 2 : 3;
    }
  } else {
    return hoken.futanWari;
  }
}

export function isUnder6(birthdate: DateWrapperLike, at: DateWrapperLike): boolean {
  console.log("enter isUnder6", birthdate, at);
  // const b6 = DateWrapper.from(birthdate).incYear(6).incDay(-1);
  let b6 = DateWrapper.from(birthdate);
  b6 = b6.incYear(6);
  b6 = b6.incDay(-1);
  console.log("b6", b6);

  let d: DateWrapper = DateWrapper.fromYearMonthDay(b6.getYear(), 3, 31);
  if (cmpNumSeq(b6.monthDayTuple(), [3, 31]) > 0) {
    d = d.incYear(1);
  }
  return DateWrapper.from(at).isBeforeOrEqual(d);
}