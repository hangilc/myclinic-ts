// 
import { dateToSqlDate, Kouhi, Koukikourei, Roujin, Shahokokuho } from "myclinic-model";
import { DateWrapper, FormatDate } from "myclinic-util";

export function padNumber(n: number, finalSize: number){
  let s = n.toString();
  while( s.length < finalSize ){
    s = "0" + s
  }
  return s;
}

export function dateToSql(d: Date): string {
  const year: number = d.getFullYear();
  const month: number = d.getMonth() + 1;
  const day: number = d.getDate();
  return `${padNumber(year, 4)}-${padNumber(month, 2)}-${padNumber(day, 2)}`;
}

export function timeToSql(d: Date): string {
  const hours: number = d.getHours();
  const minutes: number = d.getMinutes();
  const seconds: number = d.getSeconds();
  return `${padNumber(hours, 2)}:${padNumber(minutes, 2)}:${padNumber(seconds, 2)}`
}

export function dateTimeToSql(d: Date): string {
  return `${dateToSql(d)} ${timeToSql(d)}`;
}

export function parseSqlDate(sqlDate: string): Date {
  if( sqlDate.length > 10 ){
    sqlDate = sqlDate.substring(0, 10);
  }
  return new Date(sqlDate);
}

export function parseOptionalSqlDate(sqlDate: string): Date | null {
  if( sqlDate.length > 10 ){
    sqlDate = sqlDate.substring(0, 10);
  }
  if( sqlDate === "0000-00-00" ){
    return null;
  } else {
    return new Date(sqlDate);
  }
}

export function sexRep(sex: string): string {
  switch(sex){
    case "M": return "男";
    case "F": return "女";
    default: return "??";
  }
}

export function birthdayRep(birthday: string): string {
  return FormatDate.f2(birthday);
}

export function replaceAll(s: string, src: string, dst: string): string {
  return s.split("").map(c => {
    if( c === src ){
      return dst;
    } else {
      return c;
    }
  }).join("");
}

export function validFromOf(hoken: Shahokokuho | Koukikourei | Roujin | Kouhi): string {
  if( hoken instanceof Shahokokuho ){
    return hoken.validFrom;
  } else if( hoken instanceof Koukikourei ){
    return hoken.validFrom;
  } else if( hoken instanceof Roujin ){
    return hoken.validFrom;
  } else if( hoken instanceof Kouhi ){
    return hoken.validFrom;
  } else {
    throw new Error("Cannot happen");
  }
}

export function yearOfSqlDate(s: string): number {
  const re = /^(\d{4})/;
  const m = s.match(re);
  if( !m ){
    throw new Error("Invalid sqldate: " + s);
  }
  return parseInt(m[1]);
}

export function monthOfSqlDate(s: string): number {
  const re = /^\d{4}-(\d{2})/;
  const m = s.match(re);
  if( !m ){
    throw new Error("Invalid sqldate: " + s);
  }
  return parseInt(m[1]);
}

export function firstDayOfMonth(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return dateToSqlDate(d);
}

export function lastDayOfMonth(year: number, month: number): string {
  return DateWrapper.fromYearMonthDay(year, month, 1).incMonth(1).incDay(-1).asSqlDate();
}

export function firstAndLastDayOf(sqldate: string): [string, string] {
  const year = yearOfSqlDate(sqldate);
  const month = monthOfSqlDate(sqldate);
  return [firstDayOfMonth(year, month), lastDayOfMonth(year, month)];
}



