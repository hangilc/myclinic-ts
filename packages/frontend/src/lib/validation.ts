import { dateToSql } from "./util";

export interface VErrorMark {
  label: string;
}

class VErrorUnit<M extends VErrorMark> {
  error: string;
  marks: M[];

  constructor(error: string, marks: M[] = []) {
    this.error = error;
    this.marks = marks;
  }

  prepend(mark: M): VErrorUnit<M> {
    return new VErrorUnit(this.error, [mark, ...this.marks]);
  }

  get message(): string {
    if (this.marks.length === 0) {
      return this.error;
    } else {
      return this.marks.map((m) => m.label).join(" : ") + this.error;
    }
  }
}

export class VError<M extends VErrorMark> {
  units: VErrorUnit<M>[];

  constructor(units: VErrorUnit<M>[] = []) {
    this.units = units;
  }

  add(err: VError<M>): void {
    this.units.push(...err.units);
  }

  get isEmpty(): boolean {
    return this.units.length === 0;
  }

  get messages(): string[] {
    return this.units.map((u) => u.message);
  }

  prepend(mark: M): VError<M> {
    return new VError(this.units.map((u) => u.prepend(mark)));
  }
}

type OkResult<T> = { ok: true; validated: T };

type ErrorResult<M extends VErrorMark> = { ok: false; error: VError<M> };

export type ValidationResult<M extends VErrorMark, T> =
  | OkResult<T>
  | ErrorResult<M>;

export class Validator<M extends VErrorMark, S, T> {
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

  unwrap(src: S, mark: () => M, ve: VError<M>): T {
    const r = this.f(src);
    if (r.ok) {
      return r.validated;
    } else {
      ve.add(r.error.prepend(mark()));
      return undefined as never;
    }
  }
}

export function valid<T>(t: T): { ok: true; validated: T } {
  return { ok: true, validated: t };
}

export class ValidatorBuilder<M extends VErrorMark> {
  marker: (label: string) => M;

  constructor(marker: (label: string) => M) {
    this.marker = marker;
  }

  invalid(error: string): ErrorResult<M> {
    const unit = new VErrorUnit<M>(error);
    const ve = new VError<M>([unit]);
    return { ok: false, error: ve };
  }

  check<S>(
    test: (s: S) => boolean,
    err: string | (() => string)
  ): Validator<M, S, S> {
    return new Validator<M, S, S>((s) => {
      if (test(s)) {
        return valid(s);
      } else {
        const m = typeof err === "string" ? err : err();
        return this.invalid(m);
      }
    });
  }

  isNotNull<T>(): Validator<M, T | null | undefined, T> {
    return new Validator<M, T | null | undefined, T>((s) => {
      if (s == null) {
        return this.invalid("Null value");
      } else {
        return valid(s);
      }
    });
  }

  isNotEmpty(): Validator<M, string, string> {
    return this.check<string>((s) => s !== "", "空白文字です");
  }

  matchRegExp(re: RegExp): Validator<M, string, string> {
    return this.check<string>((s) => re.test(s), "入力が不適切です");
  }

  toInt(): Validator<M, string | number, number> {
    return new Validator<M, string | number, number>((s) => {
      const n = Number(s);
      if (Number.isInteger(n)) {
        return valid(n);
      } else {
        return this.invalid("整数でありません");
      }
    });
  }

  isInt(): Validator<M, number, number> {
    return this.check<number>((s) => Number.isInteger(s), "整数でありません");
  }

  toFloat(): Validator<M, string | number, number> {
    return new Validator<M, string | number, number>((s) => {
      const n = Number(s);
      if (!Number.isNaN(n)) {
        return valid(n);
      } else {
        return this.invalid("数値でありません");
      }
    });
  }

  isPositive(): Validator<M, number, number> {
    return this.check<number>((s) => s > 0, "正の数でありません");
  }

  isZeroOrPositive(): Validator<M, number, number> {
    return this.check<number>(
      (t: number) => t >= 0,
      "正またはゼロの数でありません。"
    );
  }

  isPositiveInt(): Validator<M, number, number> {
    return this.isInt().and(this.isPositive());
  }

  isZeroOrPositiveInt(): Validator<M, number, number> {
    return this.isInt().and(this.isZeroOrPositive());
  }

  isInRange(min: number, max: number): Validator<M, number, number> {
    return this.check<number>(
      (s) => min <= s && s <= max,
      () => `${min} と ${max} の間の範囲でありません。`
    );
  }

  isOneOf<T>(alts: T[]): Validator<M, T, T> {
    return new Validator<M, T, T>((s: T) => {
      if (alts.includes(s)) {
        return valid(s);
      } else {
        return this.invalid(
          alts.map((c) => `${c}`).join(", ") + " でありません。"
        );
      }
    });
  }

  toSqlDate(): Validator<M, Date, string> {
    return new Validator<M, Date, string>((s) => {
      return valid(dateToSql(s));
    });
  }

  toOptionalSqlDate(): Validator<M, Date | null, string> {
    return new Validator<M, Date | null, string>((s: Date | null) => {
      return valid(s === null ? "0000-00-00" : dateToSql(s));
    });
  }
}

export class MessageValidatorBuilder extends ValidatorBuilder<VErrorMark> {
  constructor() {
    super((label: string) => ({
      label,
    }));
  }
}
