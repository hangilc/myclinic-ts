export function splitOneLine(s: string): [string, string] {
  const i = s.indexOf("\n");
  if( i >= 0 ){
    return [s.substring(0, i), s.substring(i+1)];
  } else {
    return [s, ""];
  }
}
