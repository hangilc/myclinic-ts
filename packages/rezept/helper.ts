import * as kanjidate from "kanjidate";
import type { HokenSelector, Hokensha, RezeptComment, RezeptVisit } from "./rezept-types";
import { RezeptShubetsuCodeBase, RezeptShubetuCodeOffset, レセプト特記事項コード, 負担区分コードNameOf, 都道府県コード } from "./codes";
import type { ShotokuKubunCode, レセプト特記事項コードCode, 負担区分コードCode } from "./codes";
import { toZenkaku } from "./zenkaku";
import { DateSet } from "./date-set";
import { Shahokokuho } from "myclinic-model";

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

export function kizaiKingakuToTen(kingaku: number): number {
  return Math.floor(Math.round(kingaku / 10.0));
}

export function shochiYakuzaiKingakuToTen(kingaku: number): number {
  if (kingaku <= 15) {
    return 0
  } else {
    return Math.ceil((kingaku - 15) / 10) + 1
  }
}

export function roundTo10(n: number): number {
  return Math.round(n / 10.0) * 10;
}

export function resolveGendogakuTokkiJikou(
  hokensha: Hokensha | undefined,
  shotokuKubun: ShotokuKubunCode | undefined): レセプト特記事項コードCode | undefined {
  if (shotokuKubun) {
    switch (shotokuKubun) {
      case "ア":
      case "現役並みⅢ":
        return レセプト特記事項コード["区ア"];
      case "イ":
      case "現役並みⅡ":
        return レセプト特記事項コード["区イ"];
      case "ウ":
      case "現役並みⅠ":
        return レセプト特記事項コード["区ウ"];
      case "エ":
      case "一般":
        return レセプト特記事項コード["区エ"];
      case "オ":
      case "低所得Ⅱ":
      case "低所得Ⅰ":
        return レセプト特記事項コード["区オ"];
      case "低所得Ⅰ（老福）": {
        return レセプト特記事項コード["区オ"];
      }
      case "低所得Ⅰ（境）": {
        return レセプト特記事項コード["区オ"];
      }
      case "オ（境）": {
        return レセプト特記事項コード["区オ"];
      }
      case "一般Ⅱ": return レセプト特記事項コード["区カ"];
      case "一般Ⅰ": return レセプト特記事項コード["区キ"];
      default: {
        return undefined;
      }
    }
  } else if (hokensha) {
    if (isKoukikourei(hokensha.hokenshaBangou)) {
      switch (hokensha.futanWari) {
        case 3: return レセプト特記事項コード["区ア"];
        case 2: return レセプト特記事項コード["区カ"];
        case 1: return レセプト特記事項コード["区キ"];
      }
    } else if (hokensha.isKoureiJukyuusha) {
      switch (hokensha.futanWari) {
        case 3: return レセプト特記事項コード["区ア"];
        case 2:
        case 1:
          return レセプト特記事項コード["区エ"];
        default: break;
      }
    }
    return undefined;
  } else {
    return undefined;
  }
}

export function isKokuho(futanshaBangou: number): boolean {
  return futanshaBangou < 1000000;
}

export function isKoukikourei(futanshaBangou: number): boolean {
  return houbetsuOf(futanshaBangou) === 39;
}

export function houbetsuOf(futanshaBangou: number): number {
  return Math.floor(futanshaBangou / 1000000);
}

function shahokokuhoRezeptShubetsOffset(hokensha: Hokensha): number {
  if (hokensha.isKoureiJukyuusha) {
    if (hokensha.futanWari === 3) {
      return RezeptShubetuCodeOffset.高齢受給７割;
    } else {
      return RezeptShubetuCodeOffset.高齢受給一般;
    }
  } else {
    if (hokensha.isHonnin) {
      return RezeptShubetuCodeOffset.本人;
    } else {
      return RezeptShubetuCodeOffset.家族;
    }
  }
}

function koukikoureiRezeptShubetsuOffset(koukikoureiFutanWari: number): number {
  if (koukikoureiFutanWari === 3) {
    return RezeptShubetuCodeOffset.高齢受給７割;
  } else {
    return RezeptShubetuCodeOffset.高齢受給一般;
  }
}

export function resolve保険種別(hokensha: Hokensha | undefined, kouhiListLength: number): number {
  if (hokensha) {
    if (isKoukikourei(hokensha.hokenshaBangou)) {
      let base = RezeptShubetsuCodeBase.後期高齢単独 + kouhiListLength * 10;
      let offset = koukikoureiRezeptShubetsuOffset(hokensha.futanWari);
      return base + offset;
    } else {
      let base = RezeptShubetsuCodeBase.社保国保単独 + kouhiListLength * 10;
      let offset = shahokokuhoRezeptShubetsOffset(hokensha);
      return base + offset;
    }
  } else {
    return RezeptShubetsuCodeBase.公費単独 + kouhiListLength * 10;
  }
}

export function commonRecord給付割合(hokensha: Hokensha): string {
  if (isKokuho(hokensha.hokenshaBangou)) {
    if (hokensha.isKoureiJukyuusha) {
      return ((10 - hokensha.futanWari) * 10).toString();
    } else {
      return "70";
    }
  } else {
    return "";
  }
}

export function optionFold<T, U>(opt: T | undefined, f: (t: T) => U, defaultValue: U): U {
  if (opt === undefined) {
    return defaultValue;
  } else {
    return f(opt);
  }
}

export function formatHokenshaBangou(hokenshaBangou: number): string {
  if (hokenshaBangou < 1000000) {
    return pad(hokenshaBangou, 8, " ");
  } else {
    return pad(hokenshaBangou, 8, "0");
  }
}

function isAllAscii(s: string): boolean {
  for (let c of s) {
    if (c.charCodeAt(0) >= 256) {
      return false;
    }
  }
  return true;
}

export function adjustString(s: string): string {
  if (isAllAscii(s)) {
    return s;
  } else {
    return toZenkaku(s);
  }
}

export function adjustOptString(s: string | undefined): string | undefined {
  if (s === undefined) {
    return undefined;
  } else {
    return adjustString(s);
  }
}

export function hokenshaRecordBangou(hokensha: Hokensha | undefined): string | undefined {
  return hokensha?.hihokenshaBangou;
}

function visitHasHokenSelector(visit: RezeptVisit, selector: HokenSelector): boolean {
  for (let shinryou of visit.shinryouList) {
    if (futanKubunIncludes(shinryou.futanKubun, selector)) {
      return true;
    }
  }
  return false;
}

export function calcJitsuNissuu(visits: RezeptVisit[], selector: HokenSelector): number {
  let ds = new DateSet();
  const days: string[] = [];
  visits.forEach(visit => {
    if (visitHasHokenSelector(visit, selector)) {
      ds.add(visit.visitedAt);
    }
  });
  return ds.length;
}

export function futanKubunIncludes(futanKubun: 負担区分コードCode, selector: HokenSelector): boolean {
  return 負担区分コードNameOf(futanKubun).includes(selector);
}

export function resolveFutankubunOfVisitComment(comm: RezeptComment, visit: RezeptVisit): 負担区分コードCode {
  if (comm.futanKubun) {
    return comm.futanKubun;
  } else {
    if (calcJitsuNissuu([visit], "H")) {
      return "1";
    } else if (calcJitsuNissuu([visit], "1")) {
      return "5";
    } else {
      throw new Error("No hoken and no kouhi.");
    }
  }
}

export function parseSqlDate(sqlDate: string): { year: number, month: number, day: number } {
  const m = sqlDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    throw new Error(`Invalid sqldate: ${sqlDate}`);
  }
  return {
    year: parseInt(m[1]),
    month: parseInt(m[2]),
    day: parseInt(m[3]),
  }
}
