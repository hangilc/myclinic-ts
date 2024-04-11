import { KouhiInterface, dateToSqlDate } from "./model";
import { Gengou, GengouList } from "kanjidate";

export function getErrorMessage(e: any): string {
  if (e instanceof Error) {
    return e.message;
  } else {
    return e.toString();
  }
}

function withPath<TInput, TOutput>(path: string, src: TInput, vtor: (src: TInput) => TOutput): TOutput {
  try {
    return vtor(src);
  } catch (e: any) {
    let msg: string;
    if (e instanceof Error) {
      msg = e.message;
    } else {
      msg = e.toString();
    }
    throw new Error(`${path}${path === "" ? "" : "："}${msg}`)
  }
}

function coerceToNumber(arg: any): number {
  let n: number;
  if (typeof arg === "number") {
    n = arg;
  } else if (typeof arg === "string") {
    arg = arg.trim();
    if (arg === "") {
      throw new Error("空白です。");
    }
    n = Number(arg);
  } else if (arg == null) {
    throw new Error("設定されていません。");
  } else {
    throw new Error("数値でありません。");
  }
  if (isNaN(n)) {
    throw new Error("数値でありません。");
  }
  return n;
}

type Refiner<T> = (arg: T) => T;

function refine<T>(arg: T, refiners: Refiner<T>[]): T {
  for (const refine of refiners) {
    arg = refine(arg);
  }
  return arg;
}

function refined<T>(arg: T, pred: (arg: T) => boolean, message: string): T {
  if (pred(arg)) {
    return arg;
  } else {
    throw new Error(message);
  }
}

function validateNonNegative(arg: any): number {
  return refine(coerceToNumber(arg), [isInt, isNonNegative]);
}

function isNotEmptyString(arg: string): string {
  return refined(arg, arg => arg !== "", "空白です。");
}

function isInt(arg: number): number {
  return refined(arg, Number.isInteger, "整数でありません。");
}

function isNonNegative(arg: number): number {
  return refined(arg, arg => arg >= 0, "負の数でず。");
}

function minValue(value: number): Refiner<number> {
  return arg => refined(arg, arg => arg >= value, `${value}以上の数でありません。`);
}

function maxValue(value: number): Refiner<number> {
  return arg => refined(arg, arg => arg <= value, `${value}以下の数でありません。`);
}

function isSqlDate(arg: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
    return arg;
  } else {
    throw new Error("日付が不適切です。");
  }
}

export interface DateInputInterface {
  gengou: string | Gengou;
  nen: string | number;
  month: string | number;
  day: string | number;
}

export class DateInput {
  gengou: string | Gengou;
  nen: string | number;
  month: string | number;
  day: string | number;

  constructor({
    gengou,
    nen,
    month,
    day,
  }: DateInputInterface) {
    this.gengou = gengou;
    this.nen = nen;
    this.month = month;
    this.day = day;
  }
}

function validateGengou(arg: any): Gengou {
  if (arg instanceof Gengou) {
    return arg;
  } else if (typeof arg === "string") {
    for (const g of GengouList) {
      if (g.kanji === arg || g.alpha === arg) {
        return g;
      }
    }
  }
  throw new Error("不適切な元号。");
}

function validateNen(arg: any): number {
  return refine(coerceToNumber(arg), [minValue(1)]);
}

function validateMonth(arg: any): number {
  return refine(coerceToNumber(arg), [minValue(1), maxValue(12)]);
}

function validateDay(arg: any): number {
  return refine(coerceToNumber(arg), [minValue(1), maxValue(31)]);
}

function validateDateInput(arg: DateInput): Date {
  const g = withPath("元号", arg.gengou, validateGengou);
  const n = withPath("年", arg.nen, validateNen);
  const m = withPath("月", arg.month, validateMonth);
  const d = withPath("日", arg.day, validateDay);
  const y = g.nenStartYear + n - 1;
  return new Date(y, m - 1, d);
}

function validateSqlDate(arg: any): string {
  if (typeof arg === "string") {
    return refine(arg, [isNotEmptyString, isSqlDate]);
  } else if (arg instanceof Date) {
    return dateToSqlDate(arg);
  } else if (arg instanceof DateInput) {
    const date = validateDateInput(arg);
    return dateToSqlDate(date);
  } else {
    throw new Error("日付でありません。");
  }
}

function validateOptSqlDate(arg: any): string {
  if (arg == null) {
    return "0000-00-00";
  } else {
    return validateSqlDate(arg);
  }
}

export function validateKouhi(obj: any): KouhiInterface {
  function validateMemo(arg: any): string | undefined {
    if (arg === undefined) {
      return arg;
    } else if (typeof arg === "string") {
      arg = arg.trim();
      if (arg === "{}" || arg === "") {
        return undefined;
      }
      try {
        JSON.parse(arg);
        return arg;
      } catch (e) {
        // nop
      }
    }
    throw new Error("JSON 形式でありません。");
  }

  return {
    kouhiId: withPath("kouhiId", obj.kouhiId, validateNonNegative),
    futansha: withPath("負担者", obj.futansha, validateNonNegative),
    jukyuusha: withPath("受給者", obj.jukyuusha, validateNonNegative),
    validFrom: withPath("期限開始", obj.validFrom, validateSqlDate),
    validUpto: withPath("期限終了", obj.validUpto, validateOptSqlDate),
    patientId: withPath("患者番号", obj.patientId, validateNonNegative),
    memo: withPath("メモ", obj.memo, validateMemo),
  }
}
