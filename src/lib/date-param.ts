import { dateToSql } from "./util"

export function dateParam(arg: Date | string): string {
  if( typeof arg !== "string" ){
    return dateToSql(arg);
  } else {
    return arg.length > 10 ? arg.substring(0, 10) : arg;
  }
}

