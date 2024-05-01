export function padLeft(arg: number | string, size: number, pad: string): string {
  let s: string;
  if( typeof(arg) === "number" ){
    s = arg.toString();
  } else {
    s = arg;
  }
  const extra = size - s.length;
  if( extra > 0 ){
    s = pad.repeat(extra) + s;
  }
  return s;
}