import { KouhiInterface, dateToSqlDate } from "./model";
import { Gengou, GengouList } from "kanjidate";

class ValidationError {
  messages: string[];

  constructor(messages: string[]) {
    this.messages = messages;
  }
}

class ValidationResult<T> {
  value: T;
  errors: string[];

  constructor(value: T) {
    this.value = value;
    this.errors = [];
  }

  static errorResult<T>(errors: string[]): ValidationResult<T> {
    const r = new ValidationResult<T>(anyValue());
    r.errors = errors;
    return r;
  }

  static collectErrors(...results: ValidationResult<unknown>[]): string[] {
    const errors: string[] = [];
    results.forEach(r => errors.push(...r.errors));
    return errors;
  }

  getValue(): T {
    if (this.isError()) {
      throw new ValidationError(this.getErrorMessages());
    }
    return this.value;
  }

  isSuccess(): boolean {
    return !this.isError();
  }

  isError(): boolean {
    return this.errors.length > 0;
  }

  getErrorMessages(): string[] {
    return this.errors;
  }

  getErrorMessage(sep: string = "\n"): string {
    return this.getErrorMessages().join("\n");
  }
}

function anyValue(): any {
  return undefined;
}

function withPath<TOutput>(path: string, vtor: () => TOutput): ValidationResult<TOutput> {
  try {
    return new ValidationResult(vtor());
  } catch (e: any) {
    let pre = path === "" ? "" : `${path}：`;
    if (e instanceof Error) {
      return ValidationResult.errorResult([`${pre}${e.message}`]);
    } else if (e instanceof ValidationError) {
      return ValidationResult.errorResult(e.messages.map(m => `${pre}${m}`));
    } else {
      return ValidationResult.errorResult([e.toString()]);
    }
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
  const g = withPath("元号", () => validateGengou(arg.gengou)).getValue();
  const n = withPath("年", () => validateNen(arg.nen)).getValue();
  const m = withPath("月", () => validateMonth(arg.month)).getValue();
  const d = withPath("日", () => validateDay(arg.day)).getValue();
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

function validateOptJsonStringified(arg: any): string | undefined {
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

export function validateKouhi(obj: any): ValidationResult<KouhiInterface> {
  const kouhiId = withPath("kouhiId", () => validateNonNegative(obj.kouhiId));
  const futansha = withPath("負担者", () => validateNonNegative(obj.futansha));
  const jukyuusha = withPath("受給者", () => validateNonNegative(obj.jukyuusha));
  const validFrom = withPath("期限開始", () => validateSqlDate(obj.validFrom));
  const validUpto = withPath("期限終了", () => validateOptSqlDate(obj.validUpto));
  const patientId = withPath("患者番号", () => validateNonNegative(obj.patientId));
  const memo = withPath("メモ", () => validateOptJsonStringified(obj.memo));
  const errors = ValidationResult.collectErrors(kouhiId, futansha, jukyuusha, validFrom, validUpto, patientId, memo);
  if (errors.length > 0) {
    return ValidationResult.errorResult(errors);
  } else {
    return new ValidationResult<KouhiInterface>({
      kouhiId: kouhiId.getValue(),
      futansha: futansha.getValue(),
      jukyuusha: jukyuusha.getValue(),
      validFrom: validFrom.getValue(),
      validUpto: validUpto.getValue(),
      patientId: patientId.getValue(),
      memo: memo.getValue(),
    });
  }
}
