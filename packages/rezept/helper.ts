import { 都道府県コード } from "./codes";
import * as kanjidate from "kanjidate";

export function calcSeikyuuMonth(year: number, month: number): [number, number] {
  let d = new Date(year, month - 1, 1);
  d = kanjidate.addMonths(d, 1);
  return [d.getFullYear(), d.getMonth() + 1];
}

export function formatYearMonth(year: number, month: number): string {
  let m = month.toString();
  if (m.length === 1) {
    m = "0" + m;
  }
  return `${year}${m}`;
}

export function extract都道府県コードfromAddress(addr: string): string {
  const m = /(...?)[都道府県]/.exec(addr);
  if (!m) {
    throw new Error("Cannot find 都道府県：" + addr);
  }
  const ken = m[1];
  const code = 都道府県コード[ken];
  if (!code) {
    throw new Error("Cannot find 都道府県コード：" + ken);
  }
  return code;
}

export function pad(n: number | string, width: number, c: string = "0"): string {
  let s: string;
  if (typeof n !== "string") {
    s = n.toString();
  } else {
    s = n;
  }
  let len = s.length;
  while (len < width) {
    s = c + s;
    len += 1;
  }
  return s;
}

export type SanteibiDate = number;
export type SanteibiCount = number;
export function formatSanteibi(info: Record<SanteibiDate, SanteibiCount>): string[] {
  const ds: string[] = [];
  for (let d = 1; d <= 31; d++) {
    if (d in info) {
      ds.push(info[d].toString());
    } else {
      ds.push("");
    }
  }
  return ds;
}

export function isEqualList<T>(a: T[], b: T[], eq: (a: T, b: T) => boolean): boolean {
  if (a.length === b.length) {
    for (let i = 0; i < a.length; i++) {
      if (!eq(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

export function classify<K, V>(items: [K, V][]): Map<K, V[]> {
  const map: Map<K, V[]> = new Map();
  items.forEach(([k, v]) => {
    if (map.has(k)) {
      map.get(k)!.push(v);
    } else {
      map.set(k, [v]);
    }
  })
  return map;
}

export function classifyBy<K, V>(items: V[], getKey: (item: V) => K): Map<K, V[]> {
  return classify(items.map(item => [getKey(item), item]));
}

export function withClassified<K, V>(items: [K, V][], handler: (k: K, vs: V[]) => void): void {
  const classified = classify(items);
  for (let k of classified.keys()) {
    const vs = Array.from(classified.get(k)!);
    handler(k, vs);
  }
}

export function withClassifiedBy<K, V>(items: V[], getKey: (item: V) => K, handler: (k: K, vs: V[]) => void): void {
  withClassified(items.map(item => [getKey(item), item]), handler);
}

export function partition<T, U>(items: (T | U)[], pred: (arg: T | U) => arg is T): [T[], U[]] {
  const ts: T[] = [];
  const us: U[] = [];
  items.forEach(item => {
    if (pred(item)) {
      ts.push(item);
    } else {
      us.push(item);
    }
  })
  return [ts, us];
}

