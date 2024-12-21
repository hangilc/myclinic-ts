import { Patient } from "./model";

export type Result<T, E> = {
  ok: true;
  value: T;
} | {
  ok: false;
  error: E;
};

export class ResultWrapper <T, E> {

}

export function matchesRegExp(src: string, re: RegExp): boolean {
  return re.test(src);
}

export function convToInt(src: string): ConvResult<number> {
  if( src === "" ){
    return {
      ok: false,
      error: "空白です。"
    }
  }
  if( matchesRegExp(src, /^\d+$/) ){
    return {
      ok: true,
      value: parseInt(src),
    }
  }
  return {
    ok: false,
    error: "整数に変換できません。"
  }
}

export function isSqlDate(src: string): boolean {
  return matchesRegExp(src, /^\d{4}-\d{2}-\d{2}$/);
}

export function isInt(arg: any): boolean {
  return Number.isInteger(arg);
}

export function assertIsInt(arg: any, msg: string) {
  if( !isInt(arg) ){
    throw new Error(msg);
  }
}

export function assertIsString(arg: any, msg: string) {
  if( typeof arg !== "string" ){
    throw new Error(msg);
  }
}

export function assertNotEmpty(arg: any, msg: string) {

}

export function confirmPatient(arg: any): Patient {
  assertIsInt(arg.patientId, "patientId が整数でありません。");
  assertNotEmpty(arg.lastName, "lastName が")
  return arg;
}
