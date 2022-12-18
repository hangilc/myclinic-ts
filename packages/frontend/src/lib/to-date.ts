export function toDate(arg: Date | string | undefined): Date {
  if( typeof arg === "string" ){
    if( arg.length > 10 ){
      arg = arg.substring(0, 10);
    }
    return new Date(arg);
  } else if (arg instanceof Date ){
    return arg;
  } else {
    return new Date();
  }
}