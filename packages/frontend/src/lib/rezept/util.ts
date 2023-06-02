import api from "@/lib/api";
import { dateToSqlDate, Patient, Visit, type DiseaseData, type HokenInfo, type Kouhi, type Koukikourei, type Shahokokuho } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { is負担区分コードName, KouhiOrderMap, RezeptShubetsuCodeBase, RezeptShubetuCodeOffset, レセプト特記事項コード, 診療識別コード, 負担区分コード, 都道府県コード, type レセプト特記事項コードCode, type 診療識別コードCode, type 負担区分コードCode } from "./codes";
import type { DiseaseItem, VisitItem } from "./visit-item";
import * as kanjidate from "kanjidate";
import { toZenkaku } from "@/lib/zenkaku";
import type { K } from "vitest/dist/types-e3c9754d";

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

export function sortKouhiList(kouhiList: Kouhi[]): void {
  function houbetsu(futansha: number): number {
    return Math.floor(futansha / 1000000);
  }

  function calcOrder(futansha: number): number {
    const hb = houbetsu(futansha);
    let order = KouhiOrderMap[hb];
    if (order === undefined) {
      if (isマル都(futansha)) {
        order = 100
      } else {
        order = futansha;
      }
    }
    return order;

  }
  kouhiList.sort((a, b) => calcOrder(a.futansha) - calcOrder(b.futansha));
}

export async function getSortedKouhiListOfVisits(visits: Visit[]): Promise<Kouhi[]> {
  const kouhiIdList: number[] = [];
  function addKouhiId(kouhiId: number): void {
    if (!kouhiIdList.includes(kouhiId)) {
      kouhiIdList.push(kouhiId);
    }
  }
  visits.forEach(visit => {
    visit.kouhiIdList.forEach(addKouhiId);
  });
  const kouhiList: Kouhi[] = await Promise.all(kouhiIdList.map(api.getKouhi));
  sortKouhiList(kouhiList);
  return kouhiList;
}

export function encodeHokensha(
  hokenShubetsu: number,
  hokenshaBangou: string,
  hihokenshaKigou: string,
  hihokenshaBangou: string,
  edaban: string
): string {
  return [hokenShubetsu.toString(), hokenshaBangou, hihokenshaKigou, hihokenshaBangou, edaban].join("|");
}

export function decodeHokensha(encoded: string): {
  hokenShubetsu: number;
  hokenshaBangou: string;
  hihokenshaKigou: string;
  hihokenshaBangou: string;
  edaban: string;
} {
  const [hokenShubetsu, hokenshaBangou, hihokenshaKigou, hihokenshaBangou, edaban] = encoded.split("|");
  return {
    hokenShubetsu: parseInt(hokenShubetsu),
    hokenshaBangou, hihokenshaKigou, hihokenshaBangou, edaban
  };
}

export function is国保(hokenshaBangou: number): boolean {
  return hokenshaBangou < 1000000;
}

// Kouhi memo 公費単独請求先
// { "kouhi-tandoku-seikyuu-saki": "shaho" } -- 社保基金
// { "kouhi-tandoku-seikyuu-saki": "kokuho" } -- 国保連合

export async function isForKokuhoRengou(visit: Visit): Promise<boolean> {
  if( visit.shahokokuhoId > 0 ){
    const shahokokuho = await api.getShahokokuho(visit.shahokokuhoId);
    return is国保(shahokokuho.hokenshaBangou);
  } else if( visit.koukikoureiId > 0 ){
    return true;
  } else {
    const kouhiList: Kouhi[] = await Promise.all(visit.kouhiIdList.map(api.getKouhi));
    sortKouhiList(kouhiList);
    if( kouhiList.length === 0 ){
      throw new Error("No hoken and no kouhi: " + JSON.stringify(visit));
    }
    const memo = kouhiList[0].memoAsJson;
    const seikyuu = memo["kouhi-tandoku-seikyuu-saki"];
    if( !seikyuu ) {
      throw new Error("Cannot resolve kouhi-tandoku-seikyuu-saki: " + JSON.stringify(kouhiList[0]));
    }
    if( seikyuu === "shaho" ){
      return false;
    } else if( seikyuu === "kokuho" ){
      return true;
    } else {
      throw new Error("Unknown seikyuu saki (should be 'shaho' or 'kokuho'): " + seikyuu);
    }
  }
}

export function isマル都(負担者番号: number): boolean {
  return [
    51136018, // 難病医療（特定疾患）
    83136010, // 難病医療
    51137016, // 特殊医療
    82138009, // 特殊医療
    82134008, // 小児精神病、被爆者の子に対する医療
    82137001, // 大気汚染関連疾病
    82137555, // 大気汚染関連疾病
    82137670, // 大気汚染関連疾病
    82137530, // 大気汚染関連疾病
    38136016, // Ｂ型・Ｃ型ウイルス肝炎治療
    38136024, // 肝がん・重度肝硬変医療
    87136008, // 妊娠高血圧症候群等
    93137008, // 結核一般医療
    83133007, // 精神通院医療
  ].includes(負担者番号);
}

function shahokokuhoRezeptShubetsOffset(shahokokuho: Shahokokuho): number {
  if (shahokokuho.koureiStore === 3) {
    return RezeptShubetuCodeOffset.高齢受給７割;
  } else if (shahokokuho.koureiStore > 0) {
    return RezeptShubetuCodeOffset.高齢受給一般;
  }
  if (shahokokuho.honninStore === 0) {
    return RezeptShubetuCodeOffset.家族;
  } else {
    return RezeptShubetuCodeOffset.本人;
  }
}

function koukikoureiRezeptShubetsuOffset(koukikourei: Koukikourei): number {
  if (koukikourei.futanWari === 3) {
    return RezeptShubetuCodeOffset.高齢受給７割;
  } else {
    return RezeptShubetuCodeOffset.高齢受給一般;
  }
}

export function resolve保険種別(shahokokuho: Shahokokuho | undefined,
  koukikourei: Koukikourei | undefined, kouhiList: Kouhi[]): number {
  if (shahokokuho) {
    let base = RezeptShubetsuCodeBase.社保国保単独 + kouhiList.length * 10;
    let offset = shahokokuhoRezeptShubetsOffset(shahokokuho);
    return base + offset;
  } else if (koukikourei) {
    let base = RezeptShubetsuCodeBase.後期高齢単独 + kouhiList.length * 10;
    let offset = koukikoureiRezeptShubetsuOffset(koukikourei);
    return base + offset;
  } else {
    return RezeptShubetsuCodeBase.公費単独 + kouhiList.length * 10;
  }
}

export async function resolve保険種別OfVisits(visits: Visit[]): Promise<number> {
  let shahokokuho: Shahokokuho | undefined = undefined;
  let koukikourei: Koukikourei | undefined = undefined;
  let kouhiIdList: number[] = [];
  for(let visit of visits){
    if( visit.shahokokuhoId > 0 && !shahokokuho ){
      shahokokuho = await api.getShahokokuho(visit.shahokokuhoId);
    }
    if( visit.koukikoureiId > 0 && !koukikourei ){
      koukikourei = await api.getKoukikourei(visit.koukikoureiId);
    }
    for(let kouhiId of visit.kouhiIdList){
      if( !kouhiIdList.includes(kouhiId) ){
        kouhiIdList.push(kouhiId);
      }
    }
  }
  const kouhiList: Kouhi[] = [];
  for(let kouhiId of kouhiIdList){
    kouhiList.push(await api.getKouhi(kouhiId));
  }
  sortKouhiList(kouhiList);
  return resolve保険種別(shahokokuho, koukikourei, kouhiList);
}

export function resolvePatientName(patient: Patient): string {
  return patient.rezeptName || patient.fullName("　");
}

export function findOnshiResultGendogaku(result: OnshiResult | undefined)
  : LimitApplicationCertificateClassificationFlagLabel | undefined {
  if (result === undefined) {
    return undefined;
  }
  if (result.isValid && result.resultList.length === 1) {
    const ri = result.resultList[0];
    const limit = ri.limitApplicationCertificateRelatedInfo;
    if (limit) {
      return limit.limitApplicationCertificateClassificationFlag;
    }
  }
  return undefined;
}

export function resolveGendogakuTokkiJikou(hoken: HokenInfo, gendo: LimitApplicationCertificateClassificationFlagLabel | undefined): レセプト特記事項コードCode | undefined {
  if (gendo) {
    switch (gendo) {
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
        console.log("add '老福' to tekiyou", JSON.stringify(hoken));
        return レセプト特記事項コード["区オ"];
      }
      case "低所得Ⅰ（境）": {
        console.log("add '境界層該当' to tekiyou", JSON.stringify(hoken));
        return レセプト特記事項コード["区オ"];
      }
      case "オ（境）": {
        console.log("add '境界層該当' to tekiyou", JSON.stringify(hoken));
        return レセプト特記事項コード["区オ"];
      }
      case "一般Ⅱ": return レセプト特記事項コード["区カ"];
      case "一般Ⅰ": return レセプト特記事項コード["区キ"];
      default: {
        console.log("Unknown 限度額区分", gendo);
        return undefined;
      }
    }
  }
  if (hoken.koukikourei) {
    switch (hoken.koukikourei.futanWari) {
      case 3: return レセプト特記事項コード["区ア"];
      case 2: return レセプト特記事項コード["区カ"];
      case 1: return レセプト特記事項コード["区キ"];
    }
  } else if (hoken.shahokokuho) {
    switch (hoken.shahokokuho.koureiStore) {
      case 3: return レセプト特記事項コード["区ア"];
      case 2:
      case 1:
        return レセプト特記事項コード["区エ"];
      default: break;
    }
  }
  return undefined;
}

export function resolveGendo(items: VisitItem[]): LimitApplicationCertificateClassificationFlagLabel | undefined {
  let gendo: LimitApplicationCertificateClassificationFlagLabel | undefined = undefined;
  items.forEach(item => {
    const g = item.onshiResult?.resultList[0]?.limitApplicationCertificateRelatedInfo?.limitApplicationCertificateClassificationFlag;
    if (g) {
      gendo = g;
    }
  });
  return gendo;
}

export function hokenshaBangouOfHoken(hoken: HokenInfo): number {
  if (hoken.shahokokuho) {
    return hoken.shahokokuho.hokenshaBangou;
  } else if (hoken.koukikourei) {
    const n = parseInt(hoken.koukikourei.hokenshaBangou);
    if (n > 0) {
      return n;
    }
  }
  throw new Error("Cannot resolve hokenshaBangou: " + JSON.stringify(hoken));
}

export async function composeDiseaseItem(diseaseId: number, isPrimary: boolean): Promise<DiseaseItem> {
  const dex: DiseaseData = await api.getDiseaseEx(diseaseId);
  return {
    disease: dex.disease,
    shuushokugoCodes: dex.adjList.map(e => {
      const [adj, master] = e;
      return adj.shuushokugocode;
    }),
    isPrimary,
  }
}

export function firstDayOfMonth(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return dateToSqlDate(d);
}

export function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return dateToSqlDate(kanjidate.addDays(d, -1));
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

export function hasHoken(visitItem: VisitItem): boolean {
  return visitItem.hoken.shahokokuho !== undefined || visitItem.hoken.koukikourei !== undefined;
}

export function calcFutanKubun(hasHoken: boolean, visitKouhiIds: number[], kouhiIds: number[]): 負担区分コードCode {
  const kouhiParts: number[] = [];
  visitKouhiIds.forEach(visitKouhiId => {
    const index = kouhiIds.findIndex(e => e === visitKouhiId);
    if (index < 0) {
      throw new Error("Cannot resolve 負担区分: " + visitKouhiId);
    }
    kouhiParts.push(index + 1);
  })
  const key = (hasHoken ? "H" : "") + kouhiParts.join("");
  if (is負担区分コードName(key)) {
    return 負担区分コード[key];
  } else {
    throw new Error("Invalid 負担区分コードNam: " + key);
  }
}

export function calcRezeptCount(items: VisitItem[]): number {
  function count(item: VisitItem): number {
    return (hasHoken(item) ? 1 : 0) +
      item.hoken.kouhiList.length;
  }
  return items.reduce((acc, ele) => acc + count(ele), 0);
}

export function calcSeikyuuMonth(year: number, month: number): [number, number] {
  let d = new Date(year, month - 1, 1);
  d = kanjidate.addMonths(d, 1);
  return [d.getFullYear(), d.getMonth() + 1];
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

export function setOf<T>(items: T[]): T[] {
  const as: T[] = [];
  items.forEach(item => {
    if( !as.includes(item) ){
      as.push(item);
    }
  });
  return as;
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

export function shikibetsuOfConduct(conductKind: number): 診療識別コードCode {
  switch (conductKind) {
    case 3: return 診療識別コード.画像診断;
    default: return 診療識別コード.処置;
  }
}
