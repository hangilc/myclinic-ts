import { dateToSql } from "./util";
import { numberSrc } from "./validator";

interface VError {
  message: string;
  marks: any[];
}

function error(message: string): VError {
  return {
    message,
    marks: [],
  };
}

function errorMessageOf(err: VError): string {
  const ms: string[] = err.marks.map((m) => {
    if (typeof m === "string") {
      return m;
    } else if (typeof m === "object") {
      if (typeof m.label === "string") {
        return m.label;
      }
    }
    return m.toString();
  });
  return [...ms, err.message].join(" : ");
}

export class VResult<T> {
  _value: T | undefined;
  _error: VError | undefined;

  constructor(value: T | undefined, error: VError | undefined) {
    this._value = value;
    this._error = error;
  }

  get isError(): boolean {
    return this._error !== undefined;
  }

  get isValid(): boolean {
    return !this.isError;
  }

  get value(): T {
    return this._value!;
  }

  get error(): VError {
    return this._error!;
  }

  validate<U>(vtor: Validator<T, U>): VResult<U> {
    if (this.isValid) {
      return vtor(this.value);
    } else {
      return new VResult<U>(undefined, this.error);
    }
  }

  mark(m: any): VResult<T> {
    if (this.isError) {
      const e = {
        message: this.error.message,
        marks: [m, ...this.error.marks],
      };
      return new VResult<T>(undefined, e);
    } else {
      return this;
    }
  }

  get errorMessage(): string {
    return errorMessageOf(this.error);
  }
}

export function valid<T>(value: T): VResult<T> {
  return new VResult<T>(value, undefined);
}

export function invalid<T>(message: string): VResult<T> {
  return new VResult<T>(undefined, error(message));
}

type Validator<S, T> = (s: S) => VResult<T>;

export function isNotNull<T>(s: T | null | undefined): VResult<T> {
  if (s != null) {
    return valid(s);
  } else {
    return invalid<T>("Null value");
  }
}

export function isNotEmpty(s: string): VResult<string> {
  if (s !== "") {
    return valid(s);
  } else {
    return invalid("空白文字です");
  }
}

export function toInt(s: string | number): VResult<number> {
  const num = Number(s);
  if (Number.isInteger(num)) {
    return valid(num);
  } else {
    return invalid<number>("整数でありません");
  }
}

export function toFloat(s: string | number): VResult<number> {
  const num = Number(s);
  if (!Number.isNaN(num)) {
    return valid(num);
  } else {
    return invalid<number>("数値でありません");
  }
}

export function matchRegExp(re: RegExp): Validator<string, string> {
  return (s) => {
    if (re.test(s)) {
      return valid(s);
    } else {
      return invalid<string>("入力が不適切です");
    }
  };
}

function ensure<T>(pred: (t: T) => boolean, error: string) {
  return (t: T) => {
    if (pred(t)) {
      return valid(t);
    } else {
      return invalid<T>(error);
    }
  };
}

export const isPositive = ensure<number>((n) => n > 0, "正の数値でありません");

export function isOneOf<T>(...choices: T[]): Validator<T, T> {
  return (t: T) => {
    if (choices.includes(t)) {
      return valid(t);
    } else {
      return invalid<T>("入力が正しい値のひとつでありません");
    }
  };
}

export function toSqlDate(date: Date): VResult<string> {
  return valid(dateToSql(date));
}

export function toOptionalSqlDate(
  date: Date | null | undefined
): VResult<string> {
  if (date === null || date === undefined) {
    return valid("0000-00-00");
  } else {
    return toSqlDate(date);
  }
}

export function isInInclusiveRange(min: number, max: number): Validator<number, number> {
  return ensure(n => min <= n && n <= max, "数値が正しい範囲内でありません");
}

export class Validated<T> {
  _value: T | undefined;
  errors: VError[];

  constructor(value: T | undefined, errors: VError[] = []) {
    this._value = value;
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

  get errorMessages(): string[] {
    return this.errors.map((e) => errorMessageOf(e));
  }
}

export function validated1<T1>(r1: VResult<T1>): Validated<[T1]> {
  if (r1.isValid) {
    return new Validated([r1.value]);
  } else {
    return new Validated<[T1]>(undefined, [r1.error]);
  }
}

export function validated2<T1, T2>(
  r1: VResult<T1>,
  r2: VResult<T2>
): Validated<[T1, T2]> {
  const init = validated1(r1);
  const last = r2;
  type RetType = [T1, T2];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
    }
  }
}

export function validated3<T1, T2, T3>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>
): Validated<[T1, T2, T3]> {
  const init = validated2(r1, r2);
  const last = r3;
  type RetType = [T1, T2, T3];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
    }
  }
}

export function validated4<T1, T2, T3, T4>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
): Validated<[T1, T2, T3, T4]> {
  const init = validated3(r1, r2, r3);
  const last = r4;
  type RetType = [T1, T2, T3, T4];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
    }
  }
}

export function validated5<T1, T2, T3, T4, T5>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
  r5: VResult<T5>,
): Validated<[T1, T2, T3, T4, T5]> {
  const init = validated4(r1, r2, r3, r4);
  const last = r5;
  type RetType = [T1, T2, T3, T4, T5];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
    }
  }
}

export function validated6<T1, T2, T3, T4, T5, T6>(
  r1: VResult<T1>,
  r2: VResult<T2>,
  r3: VResult<T3>,
  r4: VResult<T4>,
  r5: VResult<T5>,
  r6: VResult<T6>,
): Validated<[T1, T2, T3, T4, T5, T6]> {
  const init = validated5(r1, r2, r3, r4, r5);
  const last = r6;
  type RetType = [T1, T2, T3, T4, T5, T6];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
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
  r7: VResult<T7>,
): Validated<[T1, T2, T3, T4, T5, T6, T7]> {
  const init = validated6(r1, r2, r3, r4, r5, r6);
  const last = r7;
  type RetType = [T1, T2, T3, T4, T5, T6, T7];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
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
  r8: VResult<T8>,
): Validated<[T1, T2, T3, T4, T5, T6, T7, T8]> {
  const init = validated7(r1, r2, r3, r4, r5, r6, r7);
  const last = r8;
  type RetType = [T1, T2, T3, T4, T5, T6, T7, T8];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
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
  r9: VResult<T9>,
): Validated<[T1, T2, T3, T4, T5, T6, T7, T8, T9]> {
  const init = validated8(r1, r2, r3, r4, r5, r6, r7, r8);
  const last = r9;
  type RetType = [T1, T2, T3, T4, T5, T6, T7, T8, T9];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
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
  r10: VResult<T10>,
): Validated<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]> {
  const init = validated9(r1, r2, r3, r4, r5, r6, r7, r8, r9);
  const last = r10;
  type RetType = [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10];
  if (init.isValid) {
    if (last.isValid) {
      return new Validated<RetType>([...init.value, last.value]);
    } else {
      return new Validated<RetType>(undefined, [last.error]);
    }
  } else {
    if (last.isValid) {
      return new Validated<RetType>(undefined, init.errors);
    } else {
      return new Validated<RetType>(undefined, [...init.errors, last.error]);
    }
  }
}

