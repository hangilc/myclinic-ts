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

class VResult<T> {
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
    return this.errors.map(e => errorMessageOf(e));
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
