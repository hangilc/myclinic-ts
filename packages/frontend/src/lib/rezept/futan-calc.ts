import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { 負担区分コードNameOf, 負担区分コードRev, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { mergeOptions, optionFold, optionForEach } from "../option";
import { calcGendogaku, isKuniKouhi2 } from "./gendogaku";

interface Cover {
  kakari: number;
  remaining: number;
}

function mergeCovers(a: Cover, b: Cover): Cover {
  return {
    kakari: a.kakari + b.kakari,
    remaining: a.remaining + b.remaining,
  }
}

function coverOptFold<T>(coverOpt: Cover | undefined, f: (c: Cover) => T, defaultValue: T): T {
  if (coverOpt === undefined) {
    return defaultValue;
  } else {
    return f(coverOpt);
  }
}

type KouhiSelector = "1" | "2" | "3" | "4";
export type HokenSelector = "H" | KouhiSelector;
export const AllHokenSelectors = ["H", "1", "2", "3", "4"] as const;

function isKouhiSelector(c: string): c is KouhiSelector {
  switch (c) {
    case "1":
    case "2":
    case "3":
    case "4":
      return true;
    default: return false;
  }
}

function isHokenSelector(c: string): c is HokenSelector {
  return c === "H" || isKouhiSelector(c);
}

function toKouhiSelector(index: number): KouhiSelector {
  switch (index) {
    case 0: return "1";
    case 1: return "2";
    case 2: return "3";
    case 3: return "4";
    default: throw new Error("Invalid kouhi index: should be one of 0, 1, 2, or 3.");
  }
}

function futanNameIncludes(futanName: 負担区分コードName, selector: HokenSelector): boolean {
  return futanName.includes(selector);
}

function kouhiSelectorToIndex(kouhiSelector: KouhiSelector): number {
  return parseInt(kouhiSelector) - 1;
}

function addNumbers(a: number, b: number): number {
  return a + b;
}

function addToAccumMap<K, V>(map: Map<K, V>, key: K, value: V, acc: (a: V, b: V) => V): void {
  const newValue = optionFold(map.get(key), cur => acc(cur, value), value);
  map.set(key, newValue);
}

function mergeAccumMap<K, V>(dst: Map<K, V>, src: Map<K, V>, acc: (a: V, b: V) => V): void {
  src.forEach((value, key) => addToAccumMap(dst, key, value, acc));
}

export class Slot {
  map: Map<HokenSelector, Cover> = new Map();

  coverOf(sel: HokenSelector): Cover | undefined {
    return this.map.get(sel);
  }

  patientChargeOf(sel: HokenSelector): number {
    return coverOptFold(this.coverOf(sel), c => c.remaining, 0);
  }

  kakariOf(sel: HokenSelector): number {
    return coverOptFold(this.coverOf(sel), c => c.kakari, 0);
  }

  mergeFrom(other: Slot): void {
    mergeAccumMap(this.map, other.map, mergeCovers);
  }

  clone(): Slot {
    const slot = new Slot();
    slot.mergeFrom(this);
    return slot;
  }

  addCover(sel: HokenSelector, cover: Cover): void {
    addToAccumMap(this.map, sel, cover, mergeCovers);
  }

  debugDump(): string {
    const obj: any = {};
    this.map.forEach((ten, code) => {
      obj[code] = ten;
    });
    return JSON.stringify(obj);
  }
}

class TotalTens {
  map: Map<負担区分コードCode, number>;

  constructor(map: Map<負担区分コードCode, number> = new Map()) {
    this.map = map;
  }

  addTen(futanCode: 負担区分コードCode, ten: number): void {
    addToAccumMap(this.map, futanCode, ten, addNumbers);
  }

  mergeFrom(other: TotalTens): void {
    mergeAccumMap(this.map, other.map, addNumbers);
  }

  get totalTen(): number {
    return Array.from(this.map.values()).reduce((a, b) => a + b, 0);
  }

  sumOf(sel: HokenSelector): number {
    let sum = 0;
    this.map.forEach((ten, code) => {
      const name = 負担区分コードRev.get(code)!;
      if (name.includes(sel)) {
        sum += ten;
      }
    })
    return sum;
  }

  sumOfFutanKubun(futanKubun: 負担区分コードCode): number {
    let sum = 0;
    this.map.forEach((ten, code) => {
      if (code === futanKubun) {
        sum += ten;
      }
    });
    return sum;
  }

  debugDump(): string {
    const obj: any = {};
    this.map.forEach((ten, code) => {
      obj[負担区分コードNameOf(code)] = ten;
    });
    return JSON.stringify(obj);
  }
}

export interface KouhiProcessorArg {
  kakari: number;
  totalTen: number;
  hokenFutanWari: number | undefined;
  prevPatientCharge: number;
  gendogakuApplied: number | undefined;
  debug?: boolean;
}

type KouhiProcessor = (arg: KouhiProcessorArg) => Cover;

export interface KouhiData {
  processor: KouhiProcessor;
  houbetsu: number;
  futanshaBangou?: number;
}

function noFutanKouhiProcessor({ kakari }: KouhiProcessorArg): Cover {
  return {
    kakari,
    remaining: 0,
  }
}

function applyGendogaku(charge: number, prevCharge: number, gendogaku: number | undefined): number {
  if (gendogaku === undefined) {
    return charge;
  } else {
    if (charge + prevCharge > gendogaku) {
      return gendogaku - prevCharge;
    } else {
      return charge;
    }
  }
}

function mkGendogakuLimitProcessor(gendogaku: number): KouhiProcessor {
  return ({ kakari, prevPatientCharge }: KouhiProcessorArg): Cover => {
    const patientCharge = applyGendogaku(kakari, prevPatientCharge, gendogaku);
    return {
      kakari,
      remaining: patientCharge,
    }
  }
}

export const HibakushaNoKo: KouhiData = {
  houbetsu: 82,
  processor: noFutanKouhiProcessor
};

// マル都（大気汚染）
export function MaruToTaikiosen(gendogaku: number): KouhiData {
  return {
    houbetsu: 82,
    processor: mkGendogakuLimitProcessor(gendogaku),
  }
}

// マル青
export const MaruAoNoFutan: KouhiData = {
  houbetsu: 89,
  processor: noFutanKouhiProcessor,
};

// マル都（難病）
export const MarutoNanbyou: KouhiData = {
  houbetsu: 82,
  processor: nanbyouProcessor,
}

function nanbyouProcessor(arg: KouhiProcessorArg): Cover {
  if (arg.debug) {
    console.log("    enter 公費難病");
    console.log("      ", JSON.stringify(arg));
  }
  const { kakari, totalTen, hokenFutanWari, prevPatientCharge, gendogakuApplied, debug } = arg;
  let patientCharge = kakari;
  if (gendogakuApplied !== undefined) {
    patientCharge = gendogakuApplied - prevPatientCharge;
    if (patientCharge < 0) {
      throw new Error("Cannot happen in MarutoNanbyou");
    }
  } else {
    if (hokenFutanWari === 3) {
      patientCharge -= totalTen;
    }
  }
  return {
    kakari,
    remaining: patientCharge,
  }
}

// 難病（国, 54）
export const KuniNanbyou: KouhiData = { houbetsu: 54, processor: nanbyouProcessor };

// 結核患者の適正医療
export const KouhiKekkaku: KouhiData = {
  houbetsu: 10,
  processor: ({ kakari, totalTen }: KouhiProcessorArg): Cover => {
    return {
      kakari,
      remaining: totalTen * 0.5,
    }
  }
}

// 更生医療
export const KouhiKouseiIryou: KouhiData = {
  houbetsu: 15,
  processor: ({ kakari, totalTen, gendogakuApplied, prevPatientCharge }: KouhiProcessorArg):
    Cover => {
    let remaining = totalTen * 1;
    if (gendogakuApplied !== undefined) {
      remaining = applyGendogaku(remaining, prevPatientCharge, gendogakuApplied);
    }
    return { kakari, remaining }
  }
}

// 生活保護
export function SeikatsuHogo(jikofutan: number = 0): KouhiData {
  function processor({ kakari, prevPatientCharge }: KouhiProcessorArg): Cover {
    const remaining = applyGendogaku(kakari, prevPatientCharge, jikofutan);
    return { kakari, remaining };
  }

  return { houbetsu: 12, processor };
}

// 精神通院
export const KuniSeishinTsuuin: KouhiData = {
  houbetsu: 21,
  processor: ({ kakari, totalTen, gendogakuApplied, prevPatientCharge }: KouhiProcessorArg): Cover => {
    let remaining = totalTen * 1;
    if (gendogakuApplied !== undefined) {
      remaining = applyGendogaku(remaining, prevPatientCharge, gendogakuApplied);
    }
    return { kakari, remaining };
  }
}

// 肝炎治療特別促進事業
export const KouhiHepatitis: KouhiData = {
  houbetsu: 38,
  processor: ({ kakari, gendogakuApplied, prevPatientCharge }: KouhiProcessorArg): Cover => {
    let remaining = kakari;
    if( gendogakuApplied !== undefined ){
      remaining = applyGendogaku(remaining, prevPatientCharge, gendogakuApplied);
    }
    return { kakari, remaining };
  }
}

// 一類・二類感染症
export const KouhiGroup1Group2Infection: KouhiData = {
  houbetsu: 28,
  processor: ({ kakari }: KouhiProcessorArg): Cover => {
    return { kakari, remaining: 0 };
  }
}

export type ShotokuKubun = LimitApplicationCertificateClassificationFlagLabel;

export type ShotokuKubunGroup = "若年" | "高齢受給" | "後期高齢";

interface ProcessHokenContext {
  totalTen: number;
  futanWari: number;
  shotokuKubun: ShotokuKubun | undefined;
  iryouKingaku: number;
  prevPatientCharge: number;
  hasKuniKouhi: boolean;
  isTasuuGaitou: boolean;
  shotokuKubunGroup?: ShotokuKubunGroup;
  isBirthdayMonth75?: boolean;
  marucho: 10000 | 20000 | undefined;
  isKourei1WariShiteiKouhi?: boolean;
  isNyuuin?: boolean;
  isSeikatsuHogo?: boolean;
  hasKouhi?: boolean;
  debug?: boolean;
}

function defaultKuniKouhiShotokuKubun(shotokuKubunGroup: ShotokuKubunGroup): ShotokuKubun {
  switch (shotokuKubunGroup) {
    case "若年": return "ウ";
    case "高齢受給": return "一般";
    case "後期高齢": return "一般Ⅰ";
  }
}

function processHokenWithFixedShotokuKubun({
  totalTen, futanWari, shotokuKubun, iryouKingaku, prevPatientCharge,
  hasKuniKouhi, isTasuuGaitou, shotokuKubunGroup, isBirthdayMonth75, isNyuuin, isSeikatsuHogo,
  hasKouhi, isKourei1WariShiteiKouhi, marucho, debug
}: ProcessHokenContext): Cover {
  const kakari = totalTen * 10;
  function gendo(): number | undefined {
    if (shotokuKubun === undefined) {
      if (hasKuniKouhi) {
        if (!shotokuKubunGroup) {
          throw new Error("Cannot resolve shotoku kubun group");
        }
        shotokuKubun = defaultKuniKouhiShotokuKubun(shotokuKubunGroup);
      } else {
        return undefined;
      }
    }
    if (shotokuKubun === "一般Ⅱ" && (hasKouhi || marucho !== undefined)) {
      shotokuKubun = "一般Ⅰ";
    }
    return calcGendogaku(shotokuKubun, iryouKingaku, {
      hasKuniKouhi, isTasuuGaitou, isBirthdayMonth75, isNyuuin, isSeikatsuHogo,
    });
  }
  const g = gendo();
  if (debug) {
    console.log("gendogaku", g === undefined ? "none" : g);
    console.log("applying gendogaku", totalTen * futanWari, prevPatientCharge);
  }
  const remaining = applyGendogaku(totalTen * futanWari, prevPatientCharge, g);
  let cover = { kakari, remaining };
  if (isKourei1WariShiteiKouhi !== undefined && isKourei1WariShiteiKouhi) {
    if (futanWari === 2) {
      cover.remaining = totalTen * 1;
    } else {
      throw new Error("Futan wari 2 expected");
    }
  }
  if (marucho !== undefined) {
    const gendo = isBirthdayMonth75 ? marucho / 2.0 : marucho;
    const remaining = applyGendogaku(cover.remaining, prevPatientCharge, gendo);
    cover = Object.assign({}, cover, { remaining });
  }
  if (debug) {
    console.log("leave processHoken with", JSON.stringify(cover));
  }
  return cover;
}

function processHoken(arg: ProcessHokenContext): Cover {
  const { debug, shotokuKubun } = arg;
  if (debug) {
    console.log("enter processHoken with arg:", JSON.stringify(arg));
  }
  return processHokenWithFixedShotokuKubun(arg);
}

class PatientChargeMap {
  map: Map<負担区分コードCode, number> = new Map();

  addPatientCharge(futanCode: 負担区分コードCode, patientCharge: number): void {
    addToAccumMap(this.map, futanCode, patientCharge, addNumbers);
  }

  mergeFrom(other: PatientChargeMap): void {
    mergeAccumMap(this.map, other.map, addNumbers);
  }

  patientChargeOf(futanKubun: 負担区分コードCode): number {
    return this.map.get(futanKubun) ?? 0;
  }

  get sum(): number {
    return Array.from(this.map.values()).reduce(addNumbers, 0);
  }

  debugDump(): string {
    const obj: any = {};
    this.map.forEach((ten, code) => {
      const name = 負担区分コードNameOf(code);
      obj[name] = ten;
    });
    return JSON.stringify(obj);
  }

  static mergeAll(...eles: PatientChargeMap[]): PatientChargeMap {
    const dst = new PatientChargeMap();
    eles.forEach(e => dst.mergeFrom(e));
    return dst;
  }
}

export class TotalCover {
  slot: Slot = new Slot();
  tens: TotalTens = new TotalTens();
  patientChargeMap: PatientChargeMap = new PatientChargeMap();

  merge(other: TotalCover): void {
    this.slot.mergeFrom(other.slot);
    this.tens.mergeFrom(other.tens);
    this.patientChargeMap.mergeFrom(other.patientChargeMap);
  }

  getCover(sel: HokenSelector): Cover | undefined {
    return this.slot.map.get(sel);
  }

  addCover(sel: HokenSelector, cover: Cover) {
    this.slot.addCover(sel, cover);
  }

  get patientCharge(): number {
    return this.patientChargeMap.sum;
  }

  debugDump(): string {
    return `SLOT: ${this.slot.debugDump()}, CHARGE: ${this.patientChargeMap.debugDump()}`
  }
}

function splitFutanKubun(futanKubun: 負担区分コードCode): HokenSelector[] {
  const name = 負担区分コードRev.get(futanKubun)!;
  return name.split("").map(c => {
    if (c === "H") {
      return "H";
    } else {
      if (isKouhiSelector(c)) {
        return c;
      } else {
        throw new Error("Invalid 負担区分コードCode: " + futanKubun);
      }
    }
  });
}

function mapTotalTens(
  totalTens: TotalTens,
  f: (futanKubun: 負担区分コードCode, totalTen: number, curTotalCover: TotalCover) => void
): TotalCover {
  const totalCover = new TotalCover();
  const futanKubuns: 負担区分コードCode[] = sortFutanKubun(Array.from(totalTens.map.keys()));
  for (let futanKubun of futanKubuns) {
    const totalTen = totalTens.map.get(futanKubun)!;
    totalCover.tens.addTen(futanKubun, totalTen);
    f(futanKubun, totalTen, totalCover);
  }
  return totalCover;
}

export interface CalcFutanGendogakuOption {
  kingaku: number;
  kouhiBangou: number; // 1-based
}

export interface CalcFutanOptions {
  isBirthdayMonth75?: true;
  gendogaku?: CalcFutanGendogakuOption | CalcFutanGendogakuOption[],
  marucho?: 10000 | 20000 | undefined; // value specifies gendogaku (10000 or 20000)
  gendogakuTasuuGaitou?: true;
  shotokuKubunGroup?: ShotokuKubunGroup;
  isKourei1WariShiteiKouhi?: boolean;
  isNyuuin?: boolean;
  debug?: boolean;
}

export function calcFutanOne(
  futanWari: number | undefined,
  shotokuKubun: ShotokuKubun | undefined,
  kouhiList: KouhiData[],
  totalTens: TotalTens,
  prevCover: TotalCover,
  opt: CalcFutanOptions = {},
): TotalCover {
  if (opt.debug) {
    console.log(`enter calcFutanOne, futanWari: ${futanWari}`);
    console.log("kouhiList", kouhiList);
    console.log("opt", opt);
  }
  const cur = mapTotalTens(totalTens, (futanKubun, totalTen, curTotalCover) => {
    if (opt.debug) {
      console.log("enter futanKubun", 負担区分コードRev.get(futanKubun));
    }
    const curKouhiList: KouhiData[] = kouhiListOfKubun(futanKubun, kouhiList);
    let kakari: number = totalTen * 10;
    const futanKubunName: 負担区分コードName = 負担区分コードRev.get(futanKubun)!;
    const selectors = splitFutanKubun(futanKubun);
    let patientCharge = kakari;
    for (let sel of selectors) {
      if (opt.debug) {
        console.log("enter hoken select", sel);
      }
      if (sel === "H") {
        if (futanWari === undefined) {
          throw new Error("Cannot find futanWari");
        }
        const accHokenCover = mergeOptions(curTotalCover.getCover("H"), prevCover.getCover("H"), mergeCovers) ||
          { kakari: 0, remaining: 0, gendogakuReached: false };
        let iryouKingaku: number;
        let prevPatientCharge: number;
        if (futanKubunName === "H") {
          const gendoCombined = resolveGendogakuCombined(curTotalCover, prevCover, futanWari, shotokuKubun, opt.shotokuKubunGroup);
          if (gendoCombined) {
            iryouKingaku = (totalTens.sumOf("H") + prevCover.tens.sumOf("H")) * 10;
            let pcm = PatientChargeMap.mergeAll(curTotalCover.patientChargeMap, prevCover.patientChargeMap);
            prevPatientCharge = pcm.sum;
          } else {
            iryouKingaku = (totalTen + prevCover.tens.sumOfFutanKubun("1")) * 10;
            prevPatientCharge = prevCover.patientChargeMap.patientChargeOf(futanKubun);
          }
        } else {
          iryouKingaku = totalTen * 10;
          prevPatientCharge = prevCover.patientChargeMap.patientChargeOf(futanKubun);
        }
        const processHokenContext: ProcessHokenContext = {
          totalTen,
          futanWari,
          shotokuKubun,
          iryouKingaku,
          prevPatientCharge,
          hasKuniKouhi: curKouhiList.findIndex(k => isKuniKouhi2(k.houbetsu, k.futanshaBangou)) >= 0,
          isTasuuGaitou: opt.gendogakuTasuuGaitou ?? false,
          shotokuKubunGroup: opt.shotokuKubunGroup,
          isBirthdayMonth75: opt.isBirthdayMonth75,
          marucho: opt.marucho,
          isKourei1WariShiteiKouhi: curKouhiList.length === 0 ? opt.isKourei1WariShiteiKouhi : undefined,
          isNyuuin: opt.isNyuuin,
          isSeikatsuHogo: curKouhiList.findIndex(d => d.houbetsu === 12) >= 0,
          hasKouhi: curKouhiList.length > 0,
          debug: opt.debug,
        };

        let hokenCover = processHoken(processHokenContext);
        curTotalCover.addCover("H", hokenCover);
        patientCharge = hokenCover.remaining;
        kakari = hokenCover.remaining;
      } else {
        const index = kouhiSelectorToIndex(sel);
        const kouhiData = kouhiList[index];
        const kouhiCover = kouhiData.processor({
          kakari,
          totalTen,
          hokenFutanWari: futanWari,
          prevPatientCharge: curTotalCover.slot.patientChargeOf(sel) + prevCover.slot.patientChargeOf(sel),
          gendogakuApplied: findGendo(opt, sel),
          debug: opt.debug,
        });
        curTotalCover.addCover(sel, kouhiCover);
        patientCharge = kouhiCover.remaining;
        
        kakari = kouhiCover.remaining;
      }
    }
    curTotalCover.patientChargeMap.addPatientCharge(futanKubun, patientCharge);
    if (opt.debug) {
      console.log("leave futanKubun", 負担区分コードNameOf(futanKubun), "with", curTotalCover.debugDump());
      ;
    }
  });
  return cur;
}

export function calcFutan(
  futanWari: number | undefined,
  shotokuKubun: ShotokuKubun | undefined,
  kouhiList: KouhiData[],
  totalTensList: Map<負担区分コードCode, number>[], // in chronological order (new one is before old one)
  opt: CalcFutanOptions = {},
): TotalCover {
  if (totalTensList.length === 0) {
    throw new Error("Empty total tens list");
  }
  let totalCover: TotalCover = new TotalCover();
  totalTensList.forEach(totalTens => {
    let tc = calcFutanOne(futanWari, shotokuKubun, kouhiList, new TotalTens(totalTens), totalCover, opt);
    if( shotokuKubun === "一般Ⅱ" ){
      let tcAlt = calcFutanOne(futanWari, "一般Ⅰ", kouhiList, new TotalTens(totalTens), totalCover, opt);
      if( tcAlt.patientCharge < tc.patientCharge ){
        tc = tcAlt;
      }
    }
    totalCover.merge(tc);
  })
  return totalCover;
}

function findGendo(opt: CalcFutanOptions, sel: KouhiSelector): number | undefined { // for Nanbyou etc.
  const kouhiBangou = parseInt(sel);
  if( opt.gendogaku !== undefined ){
    if( Array.isArray(opt.gendogaku) ){
      for(let gendo of opt.gendogaku ){
        if( gendo.kouhiBangou === kouhiBangou ){
          return gendo.kingaku;
        }
      }
    } else {
      const gendo = opt.gendogaku;
      if( gendo.kouhiBangou === kouhiBangou ){
        return gendo.kingaku;
      }
    }
  }
  // if (opt.gendogaku && opt.gendogaku.kouhiBangou === kouhiBangou) {
  //   return opt.gendogaku.kingaku;
  // }
  return undefined;
}

export function sortFutanKubun(kubuns: 負担区分コードCode[]): 負担区分コードCode[] {
  kubuns.sort((a, b) => {
    const na = 負担区分コードRev.get(a)!;
    const nb = 負担区分コードRev.get(b)!;
    return -(na.length - nb.length);
  });
  return kubuns;
}

function kouhiListOfKubun(kubun: 負担区分コードCode, allKouhiList: KouhiData[]):
  KouhiData[] {
  const ks: KouhiData[] = [];
  負担区分コードNameOf(kubun).split("").forEach((k) => {
    if (k !== "H") {
      const i = parseInt(k);
      const kouhiData: KouhiData = allKouhiList[i - 1];
      if (kouhiData === undefined) {
        throw new Error("Cannot find KouhiData");
      }
      ks.push(kouhiData);
    }
  });
  return ks;
}

function hairyosochiNotApplicable(hasMarucho: boolean, kouhiList: KouhiData[]): boolean {
  return hasMarucho || kouhiList.length > 0;
}

function canCombineGendogaku(shotokuKubun: ShotokuKubun, hokenFutan: number, kouhiFutan: number): boolean {
  switch (shotokuKubun) {
    case "エ":
    case "オ":
    case "現役並みⅢ":
    case "現役並みⅡ":
    case "現役並みⅠ":
    case "一般Ⅱ":
    case "一般Ⅰ":
    case "一般":
    case "低所得Ⅱ":
    case "低所得Ⅰ":
    case "低所得Ⅰ（老福）":
    case "低所得Ⅰ（境）":
      return true;
    default: return hokenFutan > 21000 && kouhiFutan > 21000;
  }
}

function resolveGendogakuCombined(curTotalCover: TotalCover, prevTotalCover: TotalCover,
  futanWari: number, shotokuKubun: ShotokuKubun | undefined, shotokuKubunGroup: ShotokuKubunGroup | undefined): boolean {
  if (shotokuKubun) {
    switch (shotokuKubun) {
      case "エ":
      case "オ":
      case "現役並みⅢ":
      case "現役並みⅡ":
      case "現役並みⅠ":
      case "一般Ⅰ":
      case "一般":
      case "低所得Ⅱ":
      case "低所得Ⅰ":
      case "低所得Ⅰ（老福）":
      case "低所得Ⅰ（境）": {
        return true;
      }
      case "一般Ⅱ": {
        return false;
      }
    }
  }
  if (shotokuKubunGroup === "高齢受給" || shotokuKubunGroup === "後期高齢") {
    return true;
  }
  let hokenOnlyTen = 0;
  let kouhiHeiyouTen = 0;
  [curTotalCover, prevTotalCover].forEach(totalCover => totalCover.tens.map.forEach((ten, code) => {
    const name = 負担区分コードNameOf(code)!;
    if (name === "H") {
      hokenOnlyTen += ten;
    } else if (name.includes("H")) {
      kouhiHeiyouTen += ten;
    }
  }));
  return hokenOnlyTen * futanWari > 21000 && kouhiHeiyouTen * futanWari > 21000;
}