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

export function toSqlDateTime(s: string): string {
  const YYYY = s.substring(0, 4);
  const MM = pad(s.substring(4, 6), 2, "0");
  const DD = pad(s.substring(6, 8), 2, "0");
  const HH = pad(s.substring(8, 10), 2, "0");
  const mm = pad(s.substring(10, 12), 2, "0");
  const ss = pad(s.substring(12, 14), 2, "0");
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

export function toOptSqlDateTime(s: string | undefined) : string | undefined {
  if( s == undefined ){
    return undefined;
  } else {
    return toSqlDateTime(s);
  }
}

export function toSqlDate(s: string): string {
  const YYYY = s.substring(0, 4);
  const MM = pad(s.substring(4, 6), 2, "0");
  const DD = pad(s.substring(6, 8), 2, "0");
  return `${YYYY}-${MM}-${DD}`;
}

export function toOptSqlDate(s: string | undefined) : string | undefined {
  if( s == undefined ){
    return undefined;
  } else {
    return toSqlDate(s);
  }
}

export function toOptInt(s: string | undefined): number | undefined {
  if( s == undefined ){
    return undefined;
  } else {
    return parseInt(s);
  }
}

