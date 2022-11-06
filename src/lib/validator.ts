import { isInteger } from "lodash";

export class ValidationError {
  isValidationError: boolean = true;
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

class ValidationResult<T> {
  value: T;
  error: string;

  constructor(value: T, error: string){
    this.value = value;
    this.error = error;
  }

  get isValid(): boolean {
    return this.error === "";
  }

  unwrap(errors: string[], prefix: string = ""): T {
    if( this.isValid ){
      return this.value;
    } else {
      errors.push(prefix + this.error);
      return undefined;
    }
  }

  static valid<T>(value: T): ValidationResult<T> {
    return new ValidationResult(value, "");
  }

  static invalid<T>(error: string): ValidationResult<T> {
    return new ValidationResult<T>(undefined, error);
  }
}

class Validator<S, T> {
  op: (src: S) => ValidationResult<T>;

  constructor(op: (src: S) => ValidationResult<T>) {
    this.op = op;
  }

  validate(src: S): ValidationResult<T> {
    return this.op(src);
  }

  bind<U>(other: Validator<T, U>): Validator<S, U> {
    return new Validator<S, U>((src: S) => {
      const r = this.op(src);
      if( r.isValid ){
        return other.op(r.value);
      } else {
        return ValidationResult.invalid<U>(r.error);
      }
    })
  }
}

export const string = new Validator<any, string>((src: any) => {
  if( typeof src === "string" ){
    return ValidationResult.valid<string>(src);
  } else {
    return ValidationResult.invalid("文字列でありません。");
  }
})

export const notEmpty = new Validator<string, string>((src: string) => {
  if( src === "" ){
    return ValidationResult.invalid("入力がありません。");
  } else {
    return ValidationResult.valid(src);
  }
})

export function regex(re: RegExp): Validator<string, string> {
  return new Validator<string, string>((src: string) => {
    if( re.test(src) ){
      return ValidationResult.valid<string>(src);
    } else {
      return ValidationResult.invalid("入力が不適切です。");
    }
  })
}

export const toNumber = new Validator<string, number>((src: string) => {
  const n = +src;
  if( isNaN(n) ){
    return ValidationResult.invalid("数値でありません。");
  } else {
    return ValidationResult.valid(n);
  }
})

export const integer = new Validator<number, number>((src: number) => {
  if( isInteger(src) ){
    return ValidationResult.valid<number>(src);
  } else {
    return ValidationResult.invalid("整数でありません。");
  }
})

