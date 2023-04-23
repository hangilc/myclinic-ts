import { dateToSql } from "./util";

function cvtToDate(d: string | Date): string {
  if (typeof d === "string") {
    return d.length > 10 ? d.substring(0, 10) : d;
  } else {
    return dateToSql(d);
  }
}

function cvtToOptDate(d: string | Date | undefined): string | undefined {
  if (d === undefined || d === "0000-00-00") {
    return undefined;
  } else {
    return cvtToDate(d);
  }
}

export function dateIntervalsOverlap(
  validFrom1: string | Date,
  validUpto1: string | Date | undefined,
  validFrom2: string | Date,
  validUpto2: string | Date | undefined
): boolean {
  const s1 = cvtToDate(validFrom1);
  const e1 = cvtToOptDate(validUpto1);
  const s2 = cvtToDate(validFrom2);
  const e2 = cvtToOptDate(validUpto2);
  if( (e2 !== undefined && e2 < s1) || (e1 !== undefined && e1 < s2) ) {
    return false;
  } else {
    return true;
  }
}

