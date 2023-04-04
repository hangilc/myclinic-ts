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

export function onshiDateTimeToSqlDateTime(s: string): string {
  const YYYY = s.substring(0, 4);
  const MM = pad(s.substring(4, 6), 2, "0");
  const DD = pad(s.substring(6, 8), 2, "0");
  const HH = pad(s.substring(8, 10), 2, "0");
  const mm = pad(s.substring(10, 12), 2, "0");
  const ss = pad(s.substring(12, 14), 2, "0");
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

// YYYY-MM-DD hh:mm:ss => YYYYMMDDhhmmss
export function fromSqlDateTime(s: string): string {
  return s.replaceAll("-", "").replace(" ", "");
}

export function onshiDateTimeOptToSqlDateTimeOpt(s: string | undefined) : string | undefined {
  if( s == undefined ){
    return undefined;
  } else {
    return onshiDateTimeToSqlDateTime(s);
  }
}

export function onshiDateToSqlDate(s: string): string {
  const YYYY = s.substring(0, 4);
  const MM = pad(s.substring(4, 6), 2, "0");
  const DD = pad(s.substring(6, 8), 2, "0");
  return `${YYYY}-${MM}-${DD}`;
}

export function fromSqlDate(s: string): string {
  return s.replaceAll("-", "");
}

export function onshiDateOptToSqlDateOpt(s: string | undefined) : string | undefined {
  if( s == undefined ){
    return undefined;
  } else {
    return onshiDateToSqlDate(s);
  }
}

export function toOptInt(s: string | undefined): number | undefined {
  if( s == undefined ){
    return undefined;
  } else {
    return parseInt(s);
  }
}

