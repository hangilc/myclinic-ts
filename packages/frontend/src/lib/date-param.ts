import { dateTimeToSql, dateToSql } from "./util"

export function dateParam(arg: Date | string): string {
  if( typeof arg !== "string" ){
    return dateToSql(arg);
  } else {
    return arg.length > 10 ? arg.substring(0, 10) : arg;
  }
}

export function dateTimeParam(arg: Date | string): string {
  if( typeof arg !== "string" ){
    return dateTimeToSql(arg);
  } else {
    return arg;
  }
}

