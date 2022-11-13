export function pad(n: number, width: number, c: string = "0"): string {
  let s = n.toString()
  let len = s.length;
  while( len < width ){
    s = c + s;
    len += 1;
  }
  return s;
}