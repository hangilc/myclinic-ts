import { dateToSql } from "./util";

export interface VError {
  message: string;
  sources: any[];
  marks: string[];
}

export function error(
  message: string,
  sources: any[],
  marks: string[]
): VError {
  return {
    message,
    sources,
    marks,
  };
}

export function addMark(err: VError, mark: any): VError {
  return Object.assign({}, err, {
    marks: [mark, ...err.marks],
  });
}

function errorMessageOf(err: VError): string {
  return [...err.marks, err.message].join(" : ");
}

export function errorMessagesOf(errs: VError[]): string[] {
  return errs.map(errorMessageOf);
}

function mergeErrors(err1: VError[], err2: VError[]): VError[] {
  return [...err1, ...err2];
}

function mergeSources(sources1: any[], sources2: any[]): any[] {
  const s: any[] = [...sources1];
  sources2.forEach((s2) => {
    if (!s.includes(s2)) {
      s.push(s2);
    }
  });
  return s;
}

export class VResult<T> {
  _value: T | undefined;
  sources: any[];
  errors: VError[];

  constructor(value: T | undefined, sources: any[], errors: VError[]) {
    this._value = value;
    this.sources = sources;
    this.errors = errors;
  }

  get isError(): boolean {
    return this.errors.length > 0;
  }

  get isValid(): boolean {
    return !this.isError;
  }

  get value(): T {
    return this._value!;
  }

  validate<U>(vtor: Validator<T, U>): VResult<U> {
    if (this.isValid) {
      return vtor(this.value, this.sources);
    } else {
      return new VResult<U>(undefined, this.sources, this.errors);
    }
  }

  map<U>(f: (t: T) => U): VResult<U> {
    if (this.isValid) {
      return new VResult<U>(f(this.value), this.sources, this.errors);
    } else {
      return new VResult<U>(undefined, this.sources, this.errors);
    }
  }

  ensure(pred: (t: T) => boolean, err: string): VResult<T> {
    if (this.isValid) {
      const ok = pred(this.value);
      if (ok) {
        return this;
      } else {
        return invalid(err, this.sources);
      }
    } else {
      return this;
    }
  }

  convertTo<U>(
    conv: (
      t: T,
      resolve: (u: U) => VResult<U>,
      reject: (err: string) => VResult<U>
    ) => VResult<U>
  ): VResult<U> {
    if (this.isValid) {
      return conv(
        this.value,
        (u) => new VResult<U>(u, this.sources, []),
        (e) =>
          new VResult<U>(undefined, this.sources, [error(e, this.sources, [])])
      );
    } else {
      return castErrorResult<U>(this);
    }
  }

  mark(m: any): VResult<T> {
    if (this.isError) {
      return new VResult<T>(
        undefined,
        this.sources,
        this.errors.map((e) => addMark(e, m))
      );
    } else {
      return this;
    }
  }

  get errorMessages(): string[] {
    return errorMessagesOf(this.errors);
  }
}

function castErrorResult<T>(r: VResult<any>): VResult<T> {
  return new VResult<T>(undefined, r.sources, r.errors);
}

export function source<T>(value: T, source: any = undefined): VResult<T> {
  return new VResult<T>(value, source == undefined ? [] : [source], []);
}

export function valid<T>(value: T, sources: any[]): VResult<T> {
  return new VResult<T>(value, sources, []);
}

export function invalid<T>(message: string, sources: any[]): VResult<T> {
  return new VResult<T>(undefined, sources, [error(message, sources, [])]);
}

type Validator<S, T> = (s: S, sources: any[]) => VResult<T>;

export function isNotNull<T>(
  s: T | null | undefined,
  sources: any[]
): VResult<T> {
  if (s != null) {
    return valid(s, sources);
  } else {
    return invalid<T>("Null value", sources);
  }
}

export function isNotEmpty(
  s: string | null | undefined,
  sources: any[]
): VResult<string> {
  return isNotNull<string>(s, sources).ensure((s) => s !== "", "空白文字です");
}

export function toNumber(
  s: string | undefined | null | number,
  sources: any[]
): VResult<number> {
  if (typeof s !== "number") {
    return isNotNull<string>(s, sources)
      .validate(isNotEmpty)
      .convertTo<number>((s, resolve, reject) => {
        const num = Number(s);
        if (Number.isInteger(num)) {
          return resolve(num);
        } else {
          return reject("数値でありません");
        }
      });
  } else {
    return valid(s, sources);
  }
}

export const isInt = ensure<number>(
  (n) => Number.isInteger(n),
  "整数でありません"
);

export const isPositive = ensure<number>((n) => n > 0, "正の数値でありません");

export function toInt(
  s: string | undefined | null | number,
  sources: any[]
): VResult<number> {
  return toNumber(s, sources).validate(isInt);
}

export function toPositiveInt(
  s: string | undefined | null | number,
  sources: any[]
): VResult<number> {
  return toInt(s, sources).validate(isPositive);
}

export function toFloat(s: string | number, sources: any[]): VResult<number> {
  const num = Number(s);
  if (!Number.isNaN(num)) {
    return valid(num, sources);
  } else {
    return invalid<number>("数値でありません", sources);
  }
}

export function matchRegExp(re: RegExp): Validator<string, string> {
  return (s, sources: any[]) => {
    if (re.test(s)) {
      return valid(s, sources);
    } else {
      return invalid<string>("入力が不適切です", sources);
    }
  };
}

export function ensure<T>(pred: (t: T) => boolean, error: string) {
  return (t: T, sources: any[]) => {
    if (pred(t)) {
      return valid(t, sources);
    } else {
      return invalid<T>(error, sources);
    }
  };
}

export function convert<T, U>(
  conv: (
    t: T,
    resolve: (u: U) => VResult<U>,
    reject: (err: string) => VResult<U>
  ) => VResult<U>
): Validator<T, U> {
  return (t: T, sources: any[]) => {
    return conv(
      t,
      (u: U) => new VResult<U>(u, sources, []),
      (e) => invalid<U>(e, sources)
    );
  };
}

export function isOneOf<T>(...choices: T[]): Validator<T, T> {
  return ensure(
    (t) => choices.includes(t),
    "入力が正しい値のひとつでありません"
  );
}

export function toSqlDate(date: Date, sources: any[]): VResult<string> {
  return valid(dateToSql(date), sources);
}

export function toOptionalSqlDate(
  date: Date | null | undefined,
  sources: any[]
): VResult<string> {
  if (date === null || date === undefined) {
    return valid("0000-00-00", sources);
  } else {
    return toSqlDate(date, sources);
  }
}

export function isInInclusiveRange(
  min: number,
  max: number
): Validator<number, number> {
  return ensure((n) => min <= n && n <= max, "数値が正しい範囲内でありません");
}

export function validated1<T1>(r1: VResult<T1>): VResult<[T1]> {
  if (r1.isValid) {
    return r1.map((t1: T1) => [t1]);
  } else {
    return new VResult<[T1]>(undefined, r1.sources, r1.errors);
  }
}

export function validated2<T1, T2>(
  r1: VResult<T1>,
  r2: VResult<T2>
): VResult<[T1, T2]> {
  const init = validated1(r1);
  const last = r2;
  type RetType = [T1, T2];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}

export function validated3<T1, T2, T3>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>
): VResult<[T1, T2, T3]> {
  const init = validated2(r1, r2);
  const last = r3;
  type RetType = [T1, T2, T3];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}

export function validated4<T1, T2, T3, T4>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>
): VResult<[T1, T2, T3, T4]> {
  const init = validated3(r1, r2, r3);
  const last = r4;
  type RetType = [T1, T2, T3, T4];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}

export function validated5<T1, T2, T3, T4, T5>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
  r5: VResult<T5>
): VResult<[T1, T2, T3, T4, T5]> {
  const init = validated4(r1, r2, r3, r4);
  const last = r5;
  type RetType = [T1, T2, T3, T4, T5];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}

export function validated6<T1, T2, T3, T4, T5, T6>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
  r5: VResult<T5>,
  r6: VResult<T6>
): VResult<[T1, T2, T3, T4, T5, T6]> {
  const init = validated5(r1, r2, r3, r4, r5);
  const last = r6;
  type RetType = [T1, T2, T3, T4, T5, T6];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}

export function validated7<T1, T2, T3, T4, T5, T6, T7>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
  r5: VResult<T5>,
  r6: VResult<T6>,
  r7: VResult<T7>
): VResult<[T1, T2, T3, T4, T5, T6, T7]> {
  const init = validated6(r1, r2, r3, r4, r5, r6);
  const last = r7;
  type RetType = [T1, T2, T3, T4, T5, T6, T7];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}

export function validated8<T1, T2, T3, T4, T5, T6, T7, T8>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
  r5: VResult<T5>,
  r6: VResult<T6>,
  r7: VResult<T7>,
  r8: VResult<T8>
): VResult<[T1, T2, T3, T4, T5, T6, T7, T8]> {
  const init = validated7(r1, r2, r3, r4, r5, r6, r7);
  const last = r8;
  type RetType = [T1, T2, T3, T4, T5, T6, T7, T8];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}

export function validated9<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
  r5: VResult<T5>,
  r6: VResult<T6>,
  r7: VResult<T7>,
  r8: VResult<T8>,
  r9: VResult<T9>
): VResult<[T1, T2, T3, T4, T5, T6, T7, T8, T9]> {
  const init = validated8(r1, r2, r3, r4, r5, r6, r7, r8);
  const last = r9;
  type RetType = [T1, T2, T3, T4, T5, T6, T7, T8, T9];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}

export function validated10<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
  r5: VResult<T5>,
  r6: VResult<T6>,
  r7: VResult<T7>,
  r8: VResult<T8>,
  r9: VResult<T9>,
  r10: VResult<T10>
): VResult<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]> {
  const init = validated9(r1, r2, r3, r4, r5, r6, r7, r8, r9);
  const last = r10;
  type RetType = [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10];
  if (init.isValid) {
    if (last.isValid) {
      return new VResult<RetType>(
        [...init.value, last.value],
        mergeSources(init.sources, last.sources),
        []
      );
    } else {
      return castErrorResult<RetType>(last);
    }
  } else {
    if (last.isValid) {
      return castErrorResult<RetType>(init);
    } else {
      return new VResult<RetType>(
        undefined,
        mergeSources(init.sources, last.sources),
        mergeErrors(init.errors, last.errors)
      );
    }
  }
}
