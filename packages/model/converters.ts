import { Gengou, GengouList } from "kanjidate";
import { KouhiInterface } from "model";
import { pipe } from "pipe";

export class MultiError {
  messages: string[];

  constructor(messages: string[]) {
    this.messages = messages;
  }
}

export function nonNull(arg: unknown, message?: string): unknown {
  if( arg != null ){
    return arg;
  } else {
    throw new Error(message ?? "設定されていません。")
  }
}

export function isNotNaN(n: number): number {
  if( !isNaN(n) ) {
    return n;
  } else {
    throw new Error("数値でありません")
  }
}

export function ensureString(arg: unknown): string {
  if( typeof arg === "string" ){
    return arg;
  } else {
    throw new Error("文字列でありません。");
  }
}

export function ensureArray(arg: unknown, message?: string): unknown[] {
  if( Array.isArray(arg) ) {
    return arg;
  } else {
    throw new Error(message ?? "配列でありません。")
  }
}

export function nonEmptyString(s: string): string {
  if( s !== "" ){
    return s;
  } else {
    throw new Error("空白文字列です。")
  }
}

export function toNumber(arg: unknown): number {
  let n: number;
  arg = nonNull(arg);
  if (typeof arg === "number") {
    n = arg;
  } else if (typeof arg === "string") {
    const s = nonEmptyString(arg.trim());
    n = Number(arg);
  } else {
    throw new Error("数値でありません。");
  }
  n = isNotNaN(n);
  return n;
}

export class ConversionResult<T> {
  value: T;
  errors: string[];

  constructor(value: T) {
    this.value = value;
    this.errors = [];
  }

  static errorResult<T>(errors: string[]): ConversionResult<T> {
    const r = new ConversionResult<T>(anyValue());
    r.errors = errors;
    return r;
  }

  static collectErrors(...results: ConversionResult<unknown>[]): string[] {
    const errors: string[] = [];
    results.forEach(r => errors.push(...r.errors));
    return errors;
  }

  getValue(): T {
    if (this.isError()) {
      throw new MultiError(this.getErrorMessages());
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
export function convertDateInputToDate(arg: DateInput): ConversionResult<Date> {
  const g = convert("元号", arg.gengou, toGengou);
  const n = convert("年", arg.nen, toNen);
  const m = convert("月", arg.month, toMonth);
  const d = convert("日", arg.day, toDay);
  const errors = ConversionResult.collectErrors(g, n, m, d);
  if (errors.length > 0) {
    return ConversionResult.errorResult(errors);
  }
  const y = g.getValue().nenStartYear + n.getValue() - 1;
  return new ConversionResult(new Date(y, m.getValue() - 1, d.getValue()));
}


function toGengou(arg: any): Gengou {
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
function toNen(arg: any): number {
  return pipe(toNumber, isInteger, isPositive)(arg);
}

function toMonth(arg: any): number {
  return pipe(toNumber, isInteger, minValue(1), maxValue(12))(arg);
}

function toDay(arg: any): number {
  return pipe(toNumber, isInteger, minValue(1), maxValue(31))(arg);
}

export function isPositive(n: number): number {
  if( n > 0 ){
    return n;
  } else {
    throw new Error("正の数でありません。")
  }
}

export function isNonNegative(n: number): number {
  if( n >= 0 ){
    return n;
  } else {
    throw new Error("負の数です。")
  }
}

export function isInteger(n: number): number {
  if( Number.isInteger(n) ){
    return n;
  } else {
    throw new Error("整数でありません。");
  }
}

export function minValue(limit: number): (arg: number) => number {
  return arg => {
    if( arg >= limit ){
      return arg;
    } else {
      throw new Error(`${limit}以上の数でありません。`)
    }
  }
}

export function maxValue(limit: number): (arg: number) => number {
  return arg => {
    if( arg >= limit ){
      return arg;
    } else {
      throw new Error(`${limit}以下の数でありません。`)
    }
  }
}

export function toNonNegativeInteger(arg: unknown): number {
  return pipe(toNumber, isInteger, isNonNegative)(arg);
}

export function isSqlDate(arg: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
    return arg;
  } else {
    throw new Error("日付が不適切です。");
  }
}

export function dateToSqlDate(d: Date): string {
  const year: number = d.getFullYear();
  const month: number = d.getMonth() + 1;
  const day: number = d.getDate();
  return `${padNumber(year, 4, "0")}-${padNumber(month, 2, "0")}-${padNumber(
    day,
    2,
    "0"
  )}`;
}

export function toSqlDate(arg: unknown): string {
  if( typeof arg === "string" ){
    let s: string = arg;
    if( s.length > 10 ){
      s = s.substring(0, 10);
    }
    return isSqlDate(s);
  } else if( arg instanceof Date ){
    return dateToSqlDate(arg);
  } else {
    throw new Error("日付に変換")
  }
}

export function convert<S, T>(src: S, f: (src: S) => T): ConversionResult<T>;
export function convert<S, T>(path: string, src: S, f: (src: S) => T): ConversionResult<T>;

export function convert<S, T>(...args: any[]): ConversionResult<T> {
  let path: string | undefined = undefined;
  let src: S;
  let conv: (arg: S) => T;
  if( args.length === 2 ){
    src = args[0];
    conv = args[1];
  } else if( args.length === 3 ){
    path = args[0];
    src = args[1];
    conv = args[2];
  } else {
    throw new Error("Invalid function call (convert).");
  }
  try {
    return new ConversionResult(conv(src));
  } catch(e: any) {
    let errors: string[];
    let pre = "";
    if( typeof path === "string" ){
      pre += "：";
    }
    if( e instanceof MultiError ){
      errors = e.messages;
    } else if (e instanceof Error ){
      errors = [e.message];
    } else {
      errors = [e.toString()];
    }
    errors = errors.map(e => pre + e);
    return ConversionResult.errorResult(errors);
  }
}

export function convertToKouhi(obj: any): ConversionResult<KouhiInterface> {
  const kouhiId = convert("kouhiId", obj.kouhiId, toNonNegativeInteger);
  const futansha = convert("負担者", obj.futansha, toNonNegativeInteger);
  const jukyuusha = convert("受給者", obj.jukyuusha, toNonNegativeInteger);
  const validFrom = convert("期限開始", obj.validFrom, toSqlDate);
  const validUpto = convert("期限終了", obj.validUpto, ToOptSqlDate(obj.validUpto));
  const patientId = convert("患者番号", obj.patientId, toNonNegativeInteger(obj.patientId));
  const memo = convert("メモ", obj.memo, ToOptJsonStringified(obj.memo));
  const errors = ConversionResult.collectErrors(kouhiId, futansha, jukyuusha, validFrom, validUpto, patientId, memo);
  if (errors.length > 0) {
    return ConversionResult.errorResult(errors);
  } else {
    return new ConversionResult<KouhiInterface>({
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
