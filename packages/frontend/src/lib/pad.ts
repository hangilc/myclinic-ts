export function pad(n: number | string, width: number, c: string = "0"): string {
  let s: string;
  if( typeof n !== "string" ){
    s = n.toString();
  } else {
    s = n;
  }
  let len = s.length;
  while( len < width ){
    s = c + s;
    len += 1;
  }
  return s;
}