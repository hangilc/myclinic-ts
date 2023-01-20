class VResult<T> {
  value: undefined | T;
  error: undefined | string;
  marks: any[] = [];

  constructor(value: T | undefined, error: string | undefined) {
    this.value = value;
    this.error = error;
  }

  get isError(): boolean {
    return this.error !== undefined;
  }

  get isValid(): boolean {
    return !this.isError;
  }

  validate<U>(vtor: Validator<T, U>): VResult<U> {
    const value = this.value;
    if( value !== undefined ){
      return vtor(value);
    } else {
      if( this.error === undefined ){
        throw new Error("should not happen in VResult::validate");
      }
      return invalid<U>(this.error);
    }
  }

  mark(m: any): VResult<T> {
    this.marks.unshift(m);
    return this;
  }

  get errorMessage(): string {
    const ms: string[] = this.marks.map(m => {
      if( typeof m === "string" ){
        return m;
      } else if( typeof m === "object" ) {
        if( typeof m.label === "string" ){
          return m.label;
        }
      }
      return m.toString();
    });
    return [...ms, this.error ?? ""].join(" : ");
  }
}

export function valid<T>(value: T): VResult<T> {
  return new VResult<T>(value, undefined);
}

export function invalid<T>(error: string): VResult<T> {
  return new VResult<T>(undefined, error);
}

type Validator<S, T> = (s: S) => VResult<T>;

export function isNotNull<T>(s: T | null | undefined): VResult<T> {
  if( s != null ) {
    return valid(s);
  } else {
    return invalid<T>("Null value");
  }
}

export function isNotEmpty(s: string): VResult<string> {
  if( s !== "" ){
    return valid(s);
  } else {
    return invalid("空白文字です");
  }
}

