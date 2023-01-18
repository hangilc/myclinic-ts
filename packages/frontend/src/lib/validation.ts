import { dateToSql } from "./util";

type VErrorUnit = string | VError;

export class VError {
  units: { name: string; error: VErrorUnit }[] = [];

  addString(name: string, error: string): void {
    this.units.push({ name, error });
  }

  addError(name: string, error: VError): void {
    this.units.push({ name, error });
  }

  add(name: string, error: string | VError): void {
    if (typeof error === "string") {
      this.addString(name, error);
    } else {
      this.addError(name, error);
    }
  }

  get isEmpty(): boolean {
    return this.units.length === 0;
  }

  get messages(): string[] {
    return this.units.flatMap((u) => {
      if (typeof u.error === "string") {
        return [this.prepend(u.name, u.error)];
      } else {
        return u.error.messages.map((m) => this.prepend(u.name, m));
      }
    });
  }

  prepend(prefix: string, s: string): string {
    if (prefix === "") {
      return s;
    } else {
      return prefix + " : " + s;
    }
  }
}

export type ValidationResult<T> =
  | { ok: true; validated: T }
  | { ok: false; error: VErrorUnit };

export class Validator<S, T> {
  constructor(public f: (src: S) => ValidationResult<T>) {}

  and<U>(v: Validator<T, U>): Validator<S, U> {
    return new Validator<S, U>((s) => {
      const r = this.f(s);
      if (r.ok) {
        const t = r.validated;
        return v.f(t);
      } else {
        return r;
      }
    });
  }

  map<U>(f: (t: T) => U): Validator<S, U> {
    return new Validator<S, U>((s: S) => {
      const r = this.f(s);
      if (r.ok) {
        return valid(f(r.validated));
      } else {
        return r;
      }
    });
  }

  unwrap(src: S, prefix: string, ve: VError): T {
    const r = this.f(src);
    if (r.ok) {
      return r.validated;
    } else {
      ve.add(prefix, r.error);
      return undefined as any;
    }
  }
}

export function valid<T>(t: T): { ok: true; validated: T } {
  return { ok: true, validated: t };
}

export function invalid(message: string): { ok: false; error: VErrorUnit } {
  return { ok: false, error: message };
}

function check<S>(
  test: (s: S) => boolean,
  message: string | (() => string)
): Validator<S, S> {
  return new Validator<S, S>((s) => {
    if (test(s)) {
      return valid(s);
    } else {
      const m = typeof message === "string" ? message : message();
      return invalid(m);
    }
  });
}

export function isNotNull<T>(): Validator<T | null | undefined, T> {
  return new Validator<T | null | undefined, T>((s) => {
    if (s == null) {
      return invalid("Null value");
    } else {
      return valid(s);
    }
  });
}

export const isNotEmpty = check<string>((s) => s !== "", "空白文字です");

export function matchRegExp(re: RegExp): Validator<string, string> {
  return check<string>((s) => re.test(s), "入力が不適切です");
}

export const toInt = new Validator<string | number, number>((s) => {
  const n = Number(s);
  if (Number.isInteger(n)) {
    return valid(n);
  } else {
    return invalid("整数でありません");
  }
});

export const isInt = check<number>(
  (s) => Number.isInteger(s),
  "整数でありません"
);

export const toFloat = new Validator<string | number, number>((s) => {
  const n = Number(s);
  if (!Number.isNaN(n)) {
    return valid(n);
  } else {
    return invalid("数値でありません");
  }
});

export const isPositive = check<number>((s) => s > 0, "正の数でありません");

export const isZeroOrPositive = check<number>(
  (t: number) => t >= 0,
  "正またはゼロの数でありません。"
);

export const isPositiveInt = isInt.and(isPositive);

export const isZeroOrPositiveInt = isInt.and(isZeroOrPositive);

export function isInRange(min: number, max: number): Validator<number, number> {
  return check<number>(
    (s) => min <= s && s <= max,
    () => `${min} と ${max} の間の範囲でありません。`
  );
}

export function isOneOf<T>(alts: T[]): Validator<T, T> {
  return new Validator<T, T>((s: T) => {
    if (alts.includes(s)) {
      return valid(s);
    } else {
      return invalid(alts.map((c) => `${c}`).join(", ") + " でありません。");
    }
  });
}

export const toSqlDate: Validator<Date, string> = new Validator<Date, string>(
  (s) => {
    return valid(dateToSql(s));
  }
);

export const toOptionalSqlDate: Validator<Date | null, string> = new Validator<
  Date | null,
  string
>((s: Date | null) => {
  return valid(s === null ? "0000-00-00" : dateToSql(s));
});
