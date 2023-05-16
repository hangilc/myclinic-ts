import { 都道府県コード } from "./codes";

export function formatYearMonth(year: number, month: number): string {
  let m = month.toString();
  if( m.length === 1 ){
    m = "0" + m;
  }
  return `${year}${m}`;
}

export function extract都道府県コードfromAddress(addr: string): string {
  const m = /(...?)[都道府県]/.exec(addr);
  if( !m ){
    throw new Error("Cannot find 都道府県：" + addr);
  }
  const ken = m[1];
  const code = 都道府県コード[ken];
  if( !code ){
    throw new Error("Cannot find 都道府県コード：" + ken);
  }
  return code;
}