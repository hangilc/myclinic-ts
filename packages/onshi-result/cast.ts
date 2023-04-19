import { quiet } from "./config";

export function castStringProp(obj: any, name: string): boolean {
  if( typeof obj === "object" ){
    let value = obj[name];
    const ok = typeof value === "string";
    if( !ok ){
      if( !quiet ){
        console.error("castStrngProp failed with name: " + name);
      }
    }
    return ok;
  } else {
    if( !quiet ){
      console.error("castStringOpt failed with no object arg: " + obj);
    }
    return false;
  }
}

export function castOptStringProp(obj: any, name: string): boolean {
  if( typeof obj === "object" ){
    let value = obj[name];
    const ok = typeof value === "string" || value === undefined;
    if( !ok ){
      if( !quiet ){
        console.error("castOptStringProp failed with name: " + name);
      }
    }
    return ok;
  } else {
    throw new Error(`Object expected (${name}): ` + obj);
  }
}

export function castOptTest<T>(arg: T | undefined, test: (t: T) => boolean): boolean {
  if( arg === undefined ){
    return true;
  } else {
    return test(arg);
  }
}

export function castOptConvert<T, U>(arg: T | undefined, cvt: (t: T) => U): U | undefined {
  if( arg === undefined ){
    return undefined;
  } else {
    return cvt(arg);
  }
}


