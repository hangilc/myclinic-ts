import { dateToSql } from "./util";

export class Valid<T> {
  constructor(public value: T) {}
}

export class Invalid {
  constructor(public error: string) {}
}

export class ValidationResult<T> {
  constructor(
    public result: Valid<T> | Invalid[],
    public prefixList: string[]
  ) {}

  get isValid(): boolean {
    return this.result instanceof Valid<T>;
  }

  get errorStrings(): string[] {
    if (this.result instanceof Valid) {
      return [];
    } else {
      return this.result.map((inv) => {
        return [...this.prefixList, inv.error].join(":");
      });
    }
  }

  and1(
    vtor: (src: T) => ValidationResult<T> | Valid<T> | Invalid
  ): ValidationResult<T> {
    if (this.result instanceof Valid<T>) {
      const r = vtor(this.result.value);
      if (r instanceof ValidationResult<T>) {
        return r.extendPrefixList(this.prefixList);
      } else if (r instanceof Valid<T>) {
        return new ValidationResult<T>(r, this.prefixList);
      } else {
        return new ValidationResult<T>([r], this.prefixList);
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
    if (this.result instanceof Valid<T>) {
      const r = vtor(this.result.value);
      if (r instanceof ValidationResult<U>) {
        return r.extendPrefixList(this.prefixList);
      } else if (r instanceof Valid<U>) {
        return new ValidationResult<U>(r, this.prefixList);
      } else {
        return new ValidationResult<U>([r], this.prefixList);
      }
    } else {
      return new ValidationResult<U>(this.result, this.prefixList);
    }
  }

  map<U>(f: (t: T) => U): ValidationResult<U> {
    if( this.result instanceof Valid<T> ){
      return new ValidationResult<U>(new Valid<U>(f(this.result.value)), this.prefixList);
    } else {
      return new ValidationResult<U>(this.result, this.prefixList);
    }
  }

  unwrap(
    errorsCollector: string[],
    cb: (isValid: boolean) => void = (_) => {}
  ): T {
    if (this.result instanceof Valid<T>) {
      cb(true);
      return this.result.value;
    } else {
      errorsCollector.push(...this.errorStrings);
      cb(false);
      return undefined as any;
    }
  }

  extendPrefixList(prefixList: string[]): ValidationResult<T> {
    return new ValidationResult<T>(
      this.result,
      prefixList.concat(this.prefixList)
    );
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
      if (r instanceof Valid<T>) {
        return and(vtors[0], ...vtors.slice(1))(r.value);
      } else {
        return r;
      }
    }
  };
}

export function strSrc(src: string, prefix?: string): ValidationResult<string> {
  return new ValidationResult(
    new Valid(src),
    prefix == undefined ? [] : [prefix]
  );
}

type VFun<T> = (src: T) => Valid<T> | Invalid;

export const notEmpty: VFun<string> = (src: string) => {
  if (src === "") {
    return new Invalid("入力がありません。");
  } else {
    return new Valid(src);
  }
};

export function regex(re: RegExp): VFun<string> {
  return (src: string) => {
    if (re.test(src)) {
      return new Valid(src);
    } else {
      return new Invalid("入力が不適切です。");
    }
  };
}

export function toNumber(src: string): Valid<number> | Invalid {
  const n = +src;
  if (isNaN(n)) {
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
        const msg =
          choices.map((c) => `${c}`).join(", ") + " でありません。";
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
