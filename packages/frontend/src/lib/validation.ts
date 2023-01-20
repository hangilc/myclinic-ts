import { Valid } from "./validator";

class ValueWrapper<T> {
  isValueWrapper: boolean = true;
  constructor(public value: T) {}
}

class ErrorWrapper {
  isErrorWrapper: boolean = true;
  constructor(public error: string) {}
}

export class VResult<T> {
  result: ValueWrapper<T> | ErrorWrapper;

  constructor(result: ValueWrapper<T> | ErrorWrapper) {
    this.result = result;
  }

  get isValid(): boolean {
    return this.result instanceof ValueWrapper<T>;
  }

  get isError(): boolean {
    return !this.isValid;
  }

  getValue(): T | undefined {
    if (this.result instanceof ValueWrapper<T>) {
      return this.result.value;
    } else {
      return undefined;
    }
  }

  getError(): string | undefined {
    if (this.result instanceof ErrorWrapper) {
      return this.result.error;
    } else {
      return undefined;
    }
  }

  flatMap<U>(f: (t: T) => VResult<U>): VResult<U> {
    if (this.result instanceof ValueWrapper<T>) {
      return f(this.result.value);
    } else {
      return invalid<U>(this.result.error);
    }
  }

  map<U>(f: (t: T) => U): VResult<U> {
    if (this.result instanceof ValueWrapper<T>) {
      const u = f(this.result.value);
      return valid<U>(u);
    } else {
      return invalid<U>(this.result.error);
    }
  }

  mark<M>(m: M): VResultWithMarks<M, T> {
    return new VResultWithMarks<M, T>(this, [m]);
  }

}

export function valid<T>(t: T): VResult<T> {
  return new VResult(new ValueWrapper(t));
}

export function invalid<T>(err: string): VResult<T> {
  return new VResult(new ErrorWrapper(err));
}

class VResultWithMarks<M, T> {
  result: VResult<T>;
  marks: M[];

  constructor(result: VResult<T>, marks: M[]) {
    this.result = result;
    this.marks = marks;
  }

  mark(m: M): VResultWithMarks<M, T> {
    return new VResultWithMarks<M, T>(this.result, [m, ...this.marks]);
  }

  getErrorWithMarks(): VErrorWithMarks<M> | undefined {
    const e = this.result.getError();
    if( e === undefined ){
      return undefined;
    } else {
      return new VErrorWithMarks<M>(e, this.marks);
    }
  }
}

class VErrorWithMarks<M> {
  error: string;
  marks: M[];
  constructor(error: string, marks: M[]){
    this.error = error;
    this.marks = marks;
  }
}

export function errorMessage<T>(r: VResultWithMarks<string, T>): string {
  const e = r.result.getError();
  if( e == undefined ){
    return "";
  } else {
    return [...r.marks, e].join(" : ");
  }
}

export function isNotNull<T>(t: T | null | undefined): VResult<T> {
  if (t != null) {
    return valid(t);
  } else {
    return invalid("Null value");
  }
}

export function isNotEmpty(t: string): VResult<string> {
  return t !== "" ? valid(t) : invalid("空白文字です");
}

export function toInt(t: string | number): VResult<number> {
    const n = Number(t);
    if (Number.isInteger(n)) {
      return valid(n);
    } else {
      return invalid("整数でありません");
    }
}

class ValidatedErrorWrapper<E> {
  error: E;
  isValidatedErrorWrapper: boolean = true;
  constructor(error: E){
    this.error = error;
  }
}

class ValidatedResult<T, E> {
  constructor(
    public result: T | ValidatedErrorWrapper<E>
  ) {}

  get isError(): boolean {
    return this.result instanceof ValidatedErrorWrapper<E>;
  }

  get isOk(): boolean {
    return !this.isError;
  }

  getValue(): 
}

export function validated1<M, T1>(r1: VResultWithMarks<M, T1>): VResult<[T1], VErrorWithMarks<M>[]> {
  
}

// import type { M } from "vitest/dist/global-58e8e951";
// import { dateToSql } from "./util";

// class VErrorUnit<M> {
//   marks: M[];
//   error: string;

//   constructor(marks: M[], error: string) {
//     this.marks = marks;
//     this.error = error;
//   }

//   prepend(mark: M): VErrorUnit<M> {
//     return new VErrorUnit([mark, ...this.marks], this.error);
//   }
// }

// export class VError<M> {
//   units: VErrorUnit<M>[];
//   isVError: boolean = true;

//   constructor(units: VErrorUnit<M>[] = []) {
//     this.units = units;
//   }

//   static from<M>(error: string): VError<M> {
//     const u = new VErrorUnit<M>([], error);
//     return new VError([u]);
//   }

//   add(err: VError<M>): void {
//     this.units.push(...err.units);
//   }

//   get isEmpty(): boolean {
//     return this.units.length === 0;
//   }

//   prepend(mark: M): VError<M> {
//     return new VError(this.units.map((u) => u.prepend(mark)));
//   }

//   combine(other: VError<M>): VError<M> {
//     return new VError<M>([...this.units, ...other.units]);
//   }

//   static empty<M>(): VError<M> {
//     return new VError<M>();
//   }
// }

// export function hasError<M>(e: any | VError<M>): boolean {
//   if (e instanceof VError<M>) {
//     return e.units.length > 0;
//   }
//   return false;
// }

// export function getError<M, T>(e: T | VError<M>): VError<M> | undefined {
//   if (e instanceof VError<M>) {
//     return e;
//   } else {
//     return undefined;
//   }
// }

// export function errorMessages(e: undefined | VError<string>): string[] {
//   if (e instanceof VError<string>) {
//     return e.units.map((u) => {
//       const ms = u.marks;
//       return [...ms, u.error].join(" : ");
//     });
//   } else {
//     return [];
//   }
// }

// export class Validator<M, S, T> {
//   constructor(public f: (src: S) => T | VError<M>) {}

//   and<U>(v: Validator<M, T, U>): Validator<M, S, U> {
//     return new Validator<M, S, U>((s) => {
//       const r = this.f(s);
//       if (r instanceof VError<M>) {
//         return r;
//       } else {
//         return v.f(r);
//       }
//     });
//   }

//   map<U>(f: (t: T) => U): Validator<M, S, U> {
//     return new Validator<M, S, U>((s: S) => {
//       const r = this.f(s);
//       if (r instanceof VError<M>) {
//         return r;
//       } else {
//         return f(r);
//       }
//     });
//   }
// }

// function ensure<M, T>(
//   test: (t: T) => boolean,
//   error: string | (() => string)
// ): Validator<M, T, T> {
//   return new Validator<M, T, T>((s: T) => {
//     if (test(s)) {
//       return s;
//     } else {
//       const e = typeof error === "string" ? error : error();
//       return VError.from(e);
//     }
//   });
// }

// export function isNotNull<M, T>(): Validator<M, T | null, T> {
//   return new Validator<M, T | null, T>((s) => {
//     if (s != null) {
//       return s;
//     } else {
//       return VError.from("Null value");
//     }
//   });
// }

// export function isNotEmpty<M>(): Validator<M, string, string> {
//   return ensure((s) => s !== "", "空白文字です");
// }

// export function matchRegExp<M>(re: RegExp): Validator<M, string, string> {
//   return ensure<M, string>((s) => re.test(s), "入力が不適切です");
// }

// export function toInt<M>(): Validator<M, string | number, number> {
//   return new Validator<M, string | number, number>((s: string | number) => {
//     const n = Number(s);
//     if (Number.isInteger(n)) {
//       return n;
//     } else {
//       return VError.from("整数でありません");
//     }
//   });
// }

// export function toFloat<M>(): Validator<M, string | number, number> {
//   return new Validator<M, string | number, number>((s) => {
//     const n = Number(s);
//     if (!Number.isNaN(n)) {
//       return n;
//     } else {
//       return VError.from("数値でありません");
//     }
//   });
// }

// export function validate<M, S, T>(
//   src: S,
//   vtor: Validator<M, S, T>,
//   mark: M
// ): T | VError<M> {
//   const r = vtor.f(src);
//   if (r instanceof VError<M>) {
//     return r.prepend(mark);
//   } else {
//     return r;
//   }
// }

// export function validated1<M, T1>(v1: T1 | VError<M>): [T1] | VError<M> {
//   if (v1 instanceof VError<M>) {
//     return v1;
//   } else {
//     return [v1];
//   }
// }

// export function validated2<M, T1, T2>(
//   v1: T1 | VError<M>,
//   v2: T2 | VError<M>
// ): [T1, T2] | VError<M> {
//   const left: [T1] | VError<M> = validated1(v1);
//   const right = v2;
//   if (left instanceof VError<M>) {
//     if (right instanceof VError<M>) {
//       return left.combine(right);
//     } else {
//       return left;
//     }
//   } else if (right instanceof VError<M>) {
//     return right;
//   } else {
//     return [...left, right];
//   }
// }

// export function validated3<M, T1, T2, T3>(
//   v1: T1 | VError<M>,
//   v2: T2 | VError<M>,
//   v3: T3 | VError<M>
// ): [T1, T2, T3] | VError<M> {
//   const left: [T1, T2] | VError<M> = validated2(v1, v2);
//   const right = v3;
//   if (left instanceof VError<M>) {
//     if (right instanceof VError<M>) {
//       return left.combine(right);
//     } else {
//       return left;
//     }
//   } else if (right instanceof VError<M>) {
//     return right;
//   } else {
//     return [...left, right];
//   }
// }

// export function validated4<M, T1, T2, T3, T4>(
//   v1: T1 | VError<M>,
//   v2: T2 | VError<M>,
//   v3: T3 | VError<M>,
//   v4: T4 | VError<M>
// ): [T1, T2, T3, T4] | VError<M> {
//   const left: [T1, T2, T3] | VError<M> = validated3(v1, v2, v3);
//   const right = v4;
//   if (left instanceof VError<M>) {
//     if (right instanceof VError<M>) {
//       return left.combine(right);
//     } else {
//       return left;
//     }
//   } else if (right instanceof VError<M>) {
//     return right;
//   } else {
//     return [...left, right];
//   }
// }

// class Source<M, S> {
//   mark: M;
//   value: S;
//   constructor(mark: M, value: S) {
//     this.mark = mark;
//     this.value = value;
//   }

//   validate<T>(vtor: Validator<M, S, T>): T | VError<M> {
//     return vtor.f(this.value);
//   }
// }

// export function source<M, S>(mark: M, value: S): Source<M, S> {
//   return new Source(mark, value);
// }
// // export class ValidatorBuilder<M extends VErrorMark> {
// //   marker: (label: string) => M;

// //   constructor(marker: (label: string) => M) {
// //     this.marker = marker;
// //   }

// //   invalid(error: string): ErrorResult<M> {
// //     const unit = new VErrorUnit<M>(error);
// //     const ve = new VError<M>([unit]);
// //     return { ok: false, error: ve };
// //   }

// //   check<S>(
// //     test: (s: S) => boolean,
// //     err: string | (() => string)
// //   ): Validator<M, S, S> {
// //     return new Validator<M, S, S>((s) => {
// //       if (test(s)) {
// //         return valid(s);
// //       } else {
// //         const m = typeof err === "string" ? err : err();
// //         return this.invalid(m);
// //       }
// //     });
// //   }

// //   isNotNull<T>(): Validator<M, T | null | undefined, T> {
// //     return new Validator<M, T | null | undefined, T>((s) => {
// //       if (s == null) {
// //         return this.invalid("Null value");
// //       } else {
// //         return valid(s);
// //       }
// //     });
// //   }

// //   isNotEmpty(): Validator<M, string, string> {
// //     return this.check<string>((s) => s !== "", "空白文字です");
// //   }

// //   matchRegExp(re: RegExp): Validator<M, string, string> {
// //     return this.check<string>((s) => re.test(s), "入力が不適切です");
// //   }

// //   toInt(): Validator<M, string | number, number> {
// //     return new Validator<M, string | number, number>((s) => {
// //       const n = Number(s);
// //       if (Number.isInteger(n)) {
// //         return valid(n);
// //       } else {
// //         return this.invalid("整数でありません");
// //       }
// //     });
// //   }

// //   isInt(): Validator<M, number, number> {
// //     return this.check<number>((s) => Number.isInteger(s), "整数でありません");
// //   }

// //   toFloat(): Validator<M, string | number, number> {
// //     return new Validator<M, string | number, number>((s) => {
// //       const n = Number(s);
// //       if (!Number.isNaN(n)) {
// //         return valid(n);
// //       } else {
// //         return this.invalid("数値でありません");
// //       }
// //     });
// //   }

// //   isPositive(): Validator<M, number, number> {
// //     return this.check<number>((s) => s > 0, "正の数でありません");
// //   }

// //   isZeroOrPositive(): Validator<M, number, number> {
// //     return this.check<number>(
// //       (t: number) => t >= 0,
// //       "正またはゼロの数でありません。"
// //     );
// //   }

// //   isPositiveInt(): Validator<M, number, number> {
// //     return this.isInt().and(this.isPositive());
// //   }

// //   isZeroOrPositiveInt(): Validator<M, number, number> {
// //     return this.isInt().and(this.isZeroOrPositive());
// //   }

// //   isInRange(min: number, max: number): Validator<M, number, number> {
// //     return this.check<number>(
// //       (s) => min <= s && s <= max,
// //       () => `${min} と ${max} の間の範囲でありません。`
// //     );
// //   }

// //   isOneOf<T>(alts: T[]): Validator<M, T, T> {
// //     return new Validator<M, T, T>((s: T) => {
// //       if (alts.includes(s)) {
// //         return valid(s);
// //       } else {
// //         return this.invalid(
// //           alts.map((c) => `${c}`).join(", ") + " でありません。"
// //         );
// //       }
// //     });
// //   }

// //   toSqlDate(): Validator<M, Date, string> {
// //     return new Validator<M, Date, string>((s) => {
// //       return valid(dateToSql(s));
// //     });
// //   }

// //   toOptionalSqlDate(): Validator<M, Date | null, string> {
// //     return new Validator<M, Date | null, string>((s: Date | null) => {
// //       return valid(s === null ? "0000-00-00" : dateToSql(s));
// //     });
// //   }
// // }

// // export class MessageValidatorBuilder extends ValidatorBuilder<VErrorMark> {
// //   constructor() {
// //     super((label: string) => ({
// //       label,
// //     }));
// //   }
// // }
