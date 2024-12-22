import { Patient, decodePatientMemo } from "./model";
import { Result, ok, error } from "./result";

export function isInt(arg: any): Result<number> {
  if (Number.isInteger(arg)) {
    return ok(arg);
  } else {
    return error("not an integer");
  }
}

export function isString(arg: any): Result<string> {
  if (typeof arg === "string") {
    return ok(arg);
  } else {
    return error("not a string");
  }
}

export function isNotEmpty(value: string): Result<string> {
  if (value !== "") {
    return ok(value);
  } else {
    return error("empty");
  }
}

export function isOneOf<T>(...choices: T[]): Check<T> {
  return (value: T) => {
    for (let c of choices) {
      if (value === c) {
        return ok(value);
      }
    }
    return error("invalid value");
  }
}

export function matches(re: RegExp): Check<string> {
  return (value: string) => {
    if( re.test(value) ){
      return ok(value);
    } else {
      return error("invalid format");
    }
  }
}

export const isSqlDate = matches(/^\d{4}-\d{2}-\d{2}$/);

type Conv<T> = (arg: any) => Result<T>;
type Check<T> = (t: T) => Result<T>;

export function expect<T>(name: string, arg: any, conv: Conv<T>, ...fs: Check<T>[]): T {
  function error(msg: string): Error {
    return new Error(`${name}: ${msg}`);
  }
  let value: T = conv(arg).unwrap();
  for (let f of fs) {
    value = f(value).unwrap();
  }
  return value;
}

export function confirmPatient(arg: any): Patient {
  expect("patientId", arg["patientId"], isInt);
  expect("lastName", arg["lastName"], isString, isNotEmpty);
  expect("firstName", arg["firstName"], isString, isNotEmpty);
  expect("lastNameYomi", arg["lastNameYomi"], isString, isNotEmpty);
  expect("firstNameYomi", arg["firstNameYomi"], isString, isNotEmpty);
  expect("sex", arg["sex"], isString, isOneOf("M", "F"));
  expect("birthday", arg["birthday"], isString, isSqlDate);
  expect("address", arg["address"], isString);
  expect("phone", arg["phone"], isString);
  decodePatientMemo(arg.memo).expect("invalid patient memo");
  return arg;
}
