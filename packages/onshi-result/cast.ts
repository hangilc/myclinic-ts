export function castStringProp(obj: any, name: string): boolean {
  if( typeof obj === "object" ){
    let value = obj[name];
    return typeof value === "string";
  } else {
    return false;
  }
}

export function castOptStringProp(obj: any, name: string): boolean {
  if( typeof obj === "object" ){
    let value = obj[name];
    return typeof value === "string" || value === undefined;
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

// export function castStringProp(obj: any, name: string): string {
//   if( typeof obj === "object" ){
//     let value = obj[name];
//     if( typeof value === "number" ){
//       value = value.toString();
//     }
//     if( typeof value === "string" ){
//       return value;
//     } else {
//       throw new Error("Cannot find string property: " + name);
//     }
//   } else {
//     throw new Error(`Object expected (${name}): ` + obj);
//   }
// }

// export function castOptStringProp(obj: any, name: string): string | undefined {
//   if( typeof obj === "object" ){
//     let value = obj[name];
//     if( typeof value === "number" ){
//       value = value.toString();
//     }
//     if( typeof value === "string" ){
//       return value;
//     } else if( value == undefined ){
//       return undefined;
//     } else {
//       throw new Error("Cannot find string property: " + name);
//     }
//   } else {
//     throw new Error(`Object expected (${name}): ` + obj);
//   }
// }

