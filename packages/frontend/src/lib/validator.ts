import { dateToSql } from "./util";
import { dateSrc } from "./validators/date-validator";

export class Valid<T> {
  constructor(public value: T) {}
}

export class Invalid {
  constructor(public error: string, public prefixList: string[] = []) {}

  unshiftPrefix(prefix?: string): Invalid {
    if (prefix == undefined) {
      return this;
    } else {
      return new Invalid(this.error, [prefix, ...this.prefixList]);
    }
  }

  toString(): string {
    return [...this.prefixList, this.error].join("：");
  }
}

export class ValidationResult<T> {
  constructor(public result: Valid<T> | Invalid[]) {}

  get isValid(): boolean {
    return this.result instanceof Valid;
  }

  get errorStrings(): string[] {
    if (this.result instanceof Valid) {
      return [];
    } else {
      return this.result.map((e) => e.toString());
    }
  }

  and1(
    vtor: (src: T) => ValidationResult<T> | Valid<T> | Invalid
  ): ValidationResult<T> {
    if (this.result instanceof Valid) {
      const r = vtor(this.result.value);
      if (r instanceof ValidationResult) {
        return r;
      } else if (r instanceof Valid) {
        return new ValidationResult(r);
      } else {
        return new ValidationResult([r]);
      }
    } else {
      return this;
    }
  }

  and(
    ...vtors: ((src: T) => ValidationResult<T> | Valid<T> | Invalid)[]
  ): ValidationResult<T> {
    if (vtors.length === 0) {
      return this;
    } else if (vtors.length === 1) {
      return this.and1(vtors[0]);
    } else {
      const [vtor, ...rest] = vtors;
      return this.and1(vtor).and(...rest);
    }
  }

  to<U>(
    vtor: (src: T) => ValidationResult<U> | Valid<U> | Invalid
  ): ValidationResult<U> {
    if (this.result instanceof Valid) {
      const r = vtor(this.result.value);
      if (r instanceof ValidationResult) {
        return r;
      } else if (r instanceof Valid) {
        return new ValidationResult(r);
      } else {
        return new ValidationResult([r]);
      }
    } else {
      return new ValidationResult(this.result);
    }
  }

  fold<U>(fValid: (v: T) => U, fError: (es: Invalid[]) => U): U {
    if (this.result instanceof Valid) {
      return fValid(this.result.value);
    } else {
      return fError(this.result);
    }
  }

  map<U>(f: (t: T) => U): ValidationResult<U> {
    if (this.result instanceof Valid) {
      return new ValidationResult<U>(new Valid<U>(f(this.result.value)));
    } else {
      return new ValidationResult<U>(this.result);
    }
  }

  unwrap(
    errorCollector: Invalid[],
    prefix?: string,
    cb: (isValid: boolean) => void = (_) => {}
  ): T {
    if (this.result instanceof Valid) {
      cb(true);
      return this.result.value;
    } else {
      errorCollector.push(...this.result.map((e) => e.unshiftPrefix(prefix)));
      cb(false);
      return undefined as any;
    }
  }
}

export function and<T>(
  top: (src: T) => Valid<T> | Invalid,
  ...vtors: ((src: T) => Valid<T> | Invalid)[]
): (src: T) => Valid<T> | Invalid {
  return (src: T) => {
    const r = top(src);
    if (vtors.length === 0) {
      return r;
    } else {
      if (r instanceof Valid) {
        return and(vtors[0], ...vtors.slice(1))(r.value);
      } else {
        return r;
      }
    }
  };
}

function genSrc<T>(src: T): ValidationResult<T> {
  return new ValidationResult<T>(new Valid(src));
}

export function strSrc(src: string): ValidationResult<string> {
  return genSrc<string>(src);
}

export function numberSrc(src: number | string): ValidationResult<number> {
  if (typeof src === "number") {
    return genSrc<number>(src);
  } else {
    return strSrc(src).and(isNotEmpty).to(toNumber);
  }
}

export function intSrc(src: number | string): ValidationResult<number> {
  return numberSrc(src).and(isInt);
}

type VFun<T> = (src: T) => Valid<T> | Invalid;

export const isNotEmpty: VFun<string> = (src: string) => {
  if (src === "") {
    return new Invalid("入力がありません。");
  } else {
    return new Valid(src);
  }
};

export function matchRegex(re: RegExp): VFun<string> {
  return (src: string) => {
    if (re.test(src)) {
      return new Valid(src);
    } else {
      return new Invalid("入力が不適切です。");
    }
  };
}

export function isNotEqual<T>(t: T): VFun<T> {
  return (src: T) => {
    if( src !== t ){
      return new Valid(src);
    } else {
      return new Invalid("不適切な値です：" + t);
    }
  }
}

export function toNumber(src: string): Valid<number> | Invalid {
  const n = +src;
  if (isNaN(n) || src === "") {
    return new Invalid("数値でありません。");
  } else {
    return new Valid(n);
  }
}

export const isInt: VFun<number> = (src: number) => {
  if (Number.isInteger(src)) {
    return new Valid(src);
  } else {
    return new Invalid("整数でありません。");
  }
};

export const isPositive: VFun<number> = pred<number>(
  (t: number) => t > 0,
  "正の数でありません。"
);

export const isZeroOrPositive: VFun<number> = pred<number>(
  (t: number) => t >= 0,
  "正またはゼロの数でありません。"
);

export const isPositiveInt: VFun<number> = and(isInt, isPositive);

export const isZeroOrPositiveInt: VFun<number> = and(isInt, isZeroOrPositive);

export function inRange(min: number, max: number): VFun<number> {
  return (n: number) => {
    if (n >= min && n <= max) {
      return new Valid(n);
    } else {
      return new Invalid(`${min} と ${max} の間の範囲でありません。`);
    }
  };
}

export function pred<T>(
  test: (t: T) => boolean,
  errorMessage: string | ((t: T) => string)
): VFun<T> {
  return (src: T) => {
    if (test(src)) {
      return new Valid(src);
    } else {
      if (typeof errorMessage === "string") {
        return new Invalid(errorMessage);
      } else {
        return new Invalid(errorMessage(src));
      }
    }
  };
}

export function oneOf<T>(
  choices: T[],
  err?: string | ((t: T) => string)
): (src: T) => Valid<T> | Invalid {
  return (src: T) => {
    if (choices.includes(src)) {
      return new Valid<T>(src);
    } else {
      if (typeof err === "string") {
        return new Invalid(err);
      } else if (err == undefined) {
        const msg = choices.map((c) => `${c}`).join(", ") + " でありません。";
        return new Invalid(msg);
      } else {
        return new Invalid(err(src));
      }
    }
  };
}

export function toSqlDate(date: Date): string {
  return dateToSql(date);
}

export function toOptionalSqlDate(date: Date | null): string {
  return date === null ? "0000-00-00" : dateToSql(date);
}

export function notNull<T>(t: T | null): Valid<T> | Invalid {
  if (t === null) {
    return new Invalid("Null pointer.");
  } else {
    return new Valid<T>(t);
  }
}

export function sqlDateSrc(
  date: Date | null,
  errors: Invalid[]
): ValidationResult<string> {
  return dateSrc(date, errors).to(notNull).map(toSqlDate);
}

export const validFromSrc = sqlDateSrc;

export function optionalSqlDateSrc(
  date: Date | null,
  errors: Invalid[]
): ValidationResult<string> {
  return dateSrc(date, errors).map(toOptionalSqlDate);
}

export const validUptoSrc = optionalSqlDateSrc;

export const isSqlDate = and<string>(matchRegex(/\d{4}-\d{2}-\d{2}/), isNotEqual("0000-00-00"));

export const isOptionalSqlDate = and<string>(matchRegex(/\d{4}-\d{2}-\d{2}/));

export const isSqlTime = and<string>(matchRegex(/\d{2}:\d{2}:\d{2}/));

