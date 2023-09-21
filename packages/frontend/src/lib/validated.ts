class Valid<T> {
  value: T;
  isValidType: boolean = true;

  constructor(value: T) {
    this.value = value;
  }
}

export type Validator<T> = (current: T | undefined) => Valid<T> | string[];

class Validated<T> {
  current: Valid<T> | string[];
  validators: Validator<T>[] = [];

  constructor(init: T) {
    this.current = new Valid(init);
  }

  isValid(): boolean {
    return this.current instanceof Valid;
  }

  isError(): boolean {
    return !this.isValid();
  }

  getValue(): T {
    if( this.current instanceof Valid ){
      return this.current.value;
    } else {
      throw new Error("Invalid value access.");
    }
  }

  getErrors(): string[] {
    if( this.current instanceof Valid ){
      return [];
    } else {
      return this.current;
    }
  }

  addValidator(validator: Validator<T>) {
    this.validators.push(validator);
  }

  validate() {
    let cur: T | undefined = undefined;
    let errs: string[] = [];
    for(const validator of this.validators){
      const r = validator(cur);
    }
  }
}