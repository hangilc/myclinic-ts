import type { M } from "vitest/dist/global-58e8e951";
import { dateToSql } from "./util";

class VErrorUnit<M> {
  marks: M[];
  error: string;

  constructor(marks: M[], error: string) {
    this.marks = marks;
    this.error = error;
  }

  prepend(mark: M): VErrorUnit<M> {
    return new VErrorUnit([mark, ...this.marks], this.error);
  }
}

export class VError<M> {
  units: VErrorUnit<M>[];
  isVError: boolean = true;

  constructor(units: VErrorUnit<M>[] = []) {
    this.units = units;
  }

  add(err: VError<M>): void {
    this.units.push(...err.units);
  }

  get isEmpty(): boolean {
    return this.units.length === 0;
  }

  prepend(mark: M): VError<M> {
    return new VError(this.units.map((u) => u.prepend(mark)));
  }

  combine(other: VError<M>): VError<M> {
    return new VError<M>([...this.units, ...other.units]);
  }

  static empty<M>(): VError<M> {
    return new VError<M>();
  }

  // get messages(): string[] {
  //   return this.units.map((u) => u.message);
  // }
}

export function hasError<M>(e: any | VError<M>): boolean {
  if( e instanceof VError<M> ){
    return e.units.length > 0;
  }
  return false;
}

export function getError<M, T>(e: T | VError<M>): VError<M> | undefined {
  if( e instanceof VError<M> ){
    return e;
  } else {
    return undefined;
  }
}

export function errorMessages(e: undefined | VError<string>): string[] {
  if( e instanceof VError<string> ){
    return e.units.map(u => {
      const ms = u.marks;
      return [...ms, u.error].join(" : ");
    });
  } else {
    return [];
  }
}

type OkResult<T> = { ok: true; validated: T };

type ErrorResult<M> = { ok: false; error: VError<M> };

export type ValidationResult<M, T> = OkResult<T> | ErrorResult<M>;

export class Validator<M, S, T> {
  constructor(public f: (src: S) => ValidationResult<M, T>) {}

  and<U>(v: Validator<M, T, U>): Validator<M, S, U> {
    return new Validator<M, S, U>((s) => {
      const r = this.f(s);
      if (r.ok) {
        const t = r.validated;
        return v.f(t);
      } else {
        return r;
      }
    });
  }

  map<U>(f: (t: T) => U): Validator<M, S, U> {
    return new Validator<M, S, U>((s: S) => {
      const r = this.f(s);
      if (r.ok) {
        return valid(f(r.validated));
      } else {
        return r;
      }
    });
  }

  unwrapWithMark(
    src: S,
    mark: () => M,
    errorHandler: (ve: VError<M>) => void
  ): T {
    const r = this.f(src);
    if (r.ok) {
      return r.validated;
    } else {
      errorHandler(r.error.prepend(mark()));
      return undefined as never;
    }
  }
}

export function valid<T>(t: T): OkResult<T> {
  return { ok: true, validated: t };
}

export function invalid<M>(error: string): ErrorResult<M> {
  const unit = new VErrorUnit<M>([], error);
  const ve = new VError<M>([unit]);
  return { ok: false, error: ve };
}

function ensure<M, T>(
  test: (t: T) => boolean,
  error: string | (() => string)
): Validator<M, T, T> {
  return new Validator<M, T, T>((s: T) => {
    if (test(s)) {
      return valid(s);
    } else {
      const e = typeof error === "string" ? error : error();
      return invalid(e);
    }
  });
}

function convert<M, S, T>(f: (s: S) => ValidationResult<M, T>) {
  return new Validator<M, S, T>(f);
}

export function isNotNull<M, T>(): Validator<M, T | null, T> {
  return new Validator<M, T | null, T>(s => {
    if( s != null ){
      return valid(s);
    } else {
      return invalid("Null value");
    }
  })
}

export function isNotEmpty<M>(): Validator<M, string, string> {
  return ensure((s) => s !== "", "空白文字です");
}

export function matchRegExp<M>(re: RegExp): Validator<M, string, string> {
  return ensure<M, string>((s) => re.test(s), "入力が不適切です");
}

export class ValidatorWithMessage<S, T> extends Validator<string, S, T> {
  constructor(f: (s: S) => ValidationResult<string, T>) {
    super(f);
  }

  // unwrap(src: S, mark: string, errorHandler: (e: VError<string>) => void): T {
  //   return this.unwrapWithMark(src, () => mark, errorHandler);
  // }
}

export function validate<M, S, T>(
  src: S,
  vtor: Validator<M, S, T>,
  mark: M
): T | VError<M> {
  const r = vtor.f(src);
  if (r.ok) {
    return r.validated;
  } else {
    return r.error.prepend(mark);
  }
}

export function validated1<M, T1>(v1: T1 | VError<M>): [T1] | VError<M> {
  if (v1 instanceof VError<M>) {
    return v1;
  } else {
    return [v1];
  }
}

export function validated2<M, T1, T2>(
  v1: T1 | VError<M>,
  v2: T2 | VError<M>
): [T1, T2] | VError<M> {
  const left: [T1] | VError<M> = validated1(v1);
  if( left instanceof VError<M> ){
    if (v2 instanceof VError<M>) {
      return left.combine(v2);
    } else {
      return left;
    }
  } else if (v2 instanceof VError<M>) {
    return v2;
  } else {
    return [...left, v2];
  }
}

export function validated3<M, T1, T2, T3>(
  v1: T1 | VError<M>,
  v2: T2 | VError<M>,
  v3: T3 | VError<M>,
): [T1, T2, T3] | VError<M> {
  const left: [T1, T2] | VError<M> = validated2(v1, v2);
  const right = v3;
  if( left instanceof VError<M> ){
    if (right instanceof VError<M>) {
      return left.combine(right);
    } else {
      return left;
    }
  } else if (right instanceof VError<M>) {
    return right;
  } else {
    return [...left, right];
  }
}

export function validated4<M, T1, T2, T3, T4>(
  v1: T1 | VError<M>,
  v2: T2 | VError<M>,
  v3: T3 | VError<M>,
  v4: T4 | VError<M>,
): [T1, T2, T3, T4] | VError<M> {
  const left: [T1, T2, T3] | VError<M> = validated3(v1, v2, v3);
  const right = v4;
  if( left instanceof VError<M> ){
    if (right instanceof VError<M>) {
      return left.combine(right);
    } else {
      return left;
    }
  } else if (right instanceof VError<M>) {
    return right;
  } else {
    return [...left, right];
  }
}


// export class ValidatorBuilder<M extends VErrorMark> {
//   marker: (label: string) => M;

//   constructor(marker: (label: string) => M) {
//     this.marker = marker;
//   }

//   invalid(error: string): ErrorResult<M> {
//     const unit = new VErrorUnit<M>(error);
//     const ve = new VError<M>([unit]);
//     return { ok: false, error: ve };
//   }

//   check<S>(
//     test: (s: S) => boolean,
//     err: string | (() => string)
//   ): Validator<M, S, S> {
//     return new Validator<M, S, S>((s) => {
//       if (test(s)) {
//         return valid(s);
//       } else {
//         const m = typeof err === "string" ? err : err();
//         return this.invalid(m);
//       }
//     });
//   }

//   isNotNull<T>(): Validator<M, T | null | undefined, T> {
//     return new Validator<M, T | null | undefined, T>((s) => {
//       if (s == null) {
//         return this.invalid("Null value");
//       } else {
//         return valid(s);
//       }
//     });
//   }

//   isNotEmpty(): Validator<M, string, string> {
//     return this.check<string>((s) => s !== "", "空白文字です");
//   }

//   matchRegExp(re: RegExp): Validator<M, string, string> {
//     return this.check<string>((s) => re.test(s), "入力が不適切です");
//   }

//   toInt(): Validator<M, string | number, number> {
//     return new Validator<M, string | number, number>((s) => {
//       const n = Number(s);
//       if (Number.isInteger(n)) {
//         return valid(n);
//       } else {
//         return this.invalid("整数でありません");
//       }
//     });
//   }

//   isInt(): Validator<M, number, number> {
//     return this.check<number>((s) => Number.isInteger(s), "整数でありません");
//   }

//   toFloat(): Validator<M, string | number, number> {
//     return new Validator<M, string | number, number>((s) => {
//       const n = Number(s);
//       if (!Number.isNaN(n)) {
//         return valid(n);
//       } else {
//         return this.invalid("数値でありません");
//       }
//     });
//   }

//   isPositive(): Validator<M, number, number> {
//     return this.check<number>((s) => s > 0, "正の数でありません");
//   }

//   isZeroOrPositive(): Validator<M, number, number> {
//     return this.check<number>(
//       (t: number) => t >= 0,
//       "正またはゼロの数でありません。"
//     );
//   }

//   isPositiveInt(): Validator<M, number, number> {
//     return this.isInt().and(this.isPositive());
//   }

//   isZeroOrPositiveInt(): Validator<M, number, number> {
//     return this.isInt().and(this.isZeroOrPositive());
//   }

//   isInRange(min: number, max: number): Validator<M, number, number> {
//     return this.check<number>(
//       (s) => min <= s && s <= max,
//       () => `${min} と ${max} の間の範囲でありません。`
//     );
//   }

//   isOneOf<T>(alts: T[]): Validator<M, T, T> {
//     return new Validator<M, T, T>((s: T) => {
//       if (alts.includes(s)) {
//         return valid(s);
//       } else {
//         return this.invalid(
//           alts.map((c) => `${c}`).join(", ") + " でありません。"
//         );
//       }
//     });
//   }

//   toSqlDate(): Validator<M, Date, string> {
//     return new Validator<M, Date, string>((s) => {
//       return valid(dateToSql(s));
//     });
//   }

//   toOptionalSqlDate(): Validator<M, Date | null, string> {
//     return new Validator<M, Date | null, string>((s: Date | null) => {
//       return valid(s === null ? "0000-00-00" : dateToSql(s));
//     });
//   }
// }

// export class MessageValidatorBuilder extends ValidatorBuilder<VErrorMark> {
//   constructor() {
//     super((label: string) => ({
//       label,
//     }));
//   }
// }
