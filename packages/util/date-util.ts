import { cmpNumSeq } from "./cmp";
import { padLeft } from "./pad";

export class DateWrapper {
  readonly date: Date;

  constructor(date: Date) {
    this.date = date;
  }

  getYear(): number {
    return this.date.getFullYear();
  }

  getMonth(): number {
    return this.date.getMonth() + 1;
  }

  getDay(): number {
    return this.date.getDate();
  }

  getDayOfWeek(): number {
    return this.date.getDay();
  }

  asDate(): Date {
    return this.date;
  }

  asSqlDate(): string {
    return dateToSqlDate(this.date);
  }

  incYear(n: number): DateWrapper {
    return new DateWrapper(incYear(this.date, n));
  }

  incMonth(n: number): DateWrapper {
    const newdate = incMonth(this.date, n);
    return new DateWrapper(newdate);
  }

  incDay(n: number): DateWrapper {
    const newdate = incDay(this.date, n);
    return new DateWrapper(newdate);
  }

  compare(arg: DateWrapperLike): 0 | 1 | -1 {
    const a = this.date;
    const b = DateWrapper.from(arg).date;
    return compare(
      [a.getFullYear(), a.getMonth(), a.getDate()],
      [b.getFullYear(), b.getMonth(), b.getDate()]
    );
  }

  isEqual(arg: DateWrapperLike): boolean {
    return this.compare(arg) === 0;
  }

  isBefore(arg: DateWrapperLike): boolean {
    return this.compare(arg) < 0;
  }

  isBeforeOrEqual(arg: DateWrapperLike): boolean {
    return this.compare(arg) <= 0;
  }

  isAfter(arg: DateWrapperLike): boolean {
    return this.compare(arg) > 0;
  }

  isAfterOrEqual(arg: DateWrapperLike): boolean {
    return this.compare(arg) >= 0;
  }

  monthDayTuple(): [number, number] {
    return [this.getMonth(), this.getDay()];
  }

  toString(): string {
    return JSON.stringify({ year: this.getYear(), month: this.getMonth(), day: this.getDay() });
  }

  static fromDate(date: Date): DateWrapper {
    return new DateWrapper(date);
  }

  static fromSqlDate(sqldate: string): DateWrapper {
    const date = sqlDateToDate(sqldate);
    return new DateWrapper(date);
  }

  static from(arg: DateWrapperLike): DateWrapper {
    if (arg instanceof DateWrapper) {
      return arg;
    } else if (arg instanceof Date) {
      return new DateWrapper(arg);
    } else {
      return DateWrapper.fromSqlDate(arg);
    }
  }

  static create(year: number, month: number, day: number): DateWrapper {
    return new DateWrapper(new Date(year, month - 1, day));
  }
}

export type DateWrapperLike = DateWrapper | Date | string;

export function calcAge(birthdate: DateWrapperLike, at: DateWrapperLike = new Date()): number {
  birthdate = DateWrapper.from(birthdate);
  at = DateWrapper.from(at);
  let age = at.getYear() - birthdate.getYear();
  if (compare(at.monthDayTuple(), birthdate.monthDayTuple()) < 0) {
    age -= 1;
  }
  return age;
}

export function sqlDateToDate(sqlDate: string): Date {
  const obj = sqlDateToObject(sqlDate);
  return new Date(obj.year, obj.month - 1, obj.day);
}

export function sqlDateToObject(sqlDate: string): { year: number, month: number, day: number } {
  return {
    year: parseInt(sqlDate.substring(0, 4)),
    month: parseInt(sqlDate.substring(5, 7)),
    day: parseInt(sqlDate.substring(8, 10)),
  }
}

function incYear(date: Date, amount: number): Date {
  date = new Date(date);
  date.setFullYear(date.getFullYear() + amount);
  return date;
}

function incMonth(date: Date, amount: number): Date {
  date = new Date(date);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  const lastDay = lastDayOfMonth(date.getFullYear(), date.getMonth() + 1);
  if (day > lastDay) {
    date.setDate(lastDay);
  } else {
    date.setDate(day);
  }
  return date;
}

function lastDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month, 1);
  d.setDate(d.getDate() - 1);
  return d.getDate();
}

function incDay(date: Date, amount: number): Date {
  date = new Date(date);
  date.setDate(date.getDate() + amount);
  return date;
}

function dateToSqlDate(d: Date): string {
  const year: number = d.getFullYear();
  const month: number = d.getMonth() + 1;
  const day: number = d.getDate();
  return `${padLeft(year, 4, "0")}-${padLeft(month, 2, "0")}-${padLeft(
    day,
    2,
    "0"
  )}`;
}

function compare(a: number[], b: number[]): 0 | 1 | -1 {
  return cmpNumSeq(a, b);
}

