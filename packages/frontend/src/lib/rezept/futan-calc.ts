import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { 負担区分コード, 負担区分コードNameOf, 負担区分コードRev, type 負担区分コードCode, type 負担区分コードName } from "./codes";
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
type HokenSelector = "H" | KouhiSelector;
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

  debugDump(): void {
    const obj: any = {};
    this.map.forEach((ten, code) => {
      obj[code] = ten;
    });
    console.log(JSON.stringify(obj));
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

  debugDump(): void {
    const obj: any = {};
    this.map.forEach((ten, code) => {
      obj[負担区分コードNameOf(code)] = ten;
    });
    console.log(JSON.stringify(obj));
  }
}

interface KouhiProcessorArg {
  kakari: number;
  totalTen: number;
  hokenFutanWari: number | undefined;
  prevPatientCharge: number;
  gendogakuApplied: number | undefined;
  debug?: boolean;
}

type KouhiProcessor = (arg: KouhiProcessorArg) => Cover;

interface KouhiData {
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
      return gendogaku;
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
  processor: (arg: KouhiProcessorArg): Cover => {
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
}

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

export type ShotokuKubun = LimitApplicationCertificateClassificationFlagLabel;

export type ShotokuKubunGroup = "若年" | "高齢受給" | "後期高齢";

interface ProcessHokenWithFixedShotokuKubunContext {
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
  hasKuniKouhi, isTasuuGaitou, shotokuKubunGroup, isBirthdayMonth75, debug
}: ProcessHokenWithFixedShotokuKubunContext): Cover {
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
    return calcGendogaku(shotokuKubun, iryouKingaku, {
      hasKuniKouhi, isTasuuGaitou, isBirthdayMonth75
    });
  }
  const remaining = applyGendogaku(totalTen * futanWari, prevPatientCharge, gendo());
  return { kakari, remaining };
}

interface ProcessHokenContext extends ProcessHokenWithFixedShotokuKubunContext {
  hasKuniKouhi: boolean;
}

function processHoken(arg: ProcessHokenContext): Cover {
  const { shotokuKubun, hasKuniKouhi, debug } = arg;
  if (debug) {
    console.log("    enter processHoken");
    console.log(`    arg: ${JSON.stringify(arg)}`);
  }
  let cover: Cover = processHokenWithFixedShotokuKubun(arg);
  if (arg.marucho !== undefined) {
    const remaining = applyGendogaku(cover.remaining, arg.prevPatientCharge, arg.marucho);
    cover = Object.assign({}, cover, { remaining });
  }
  return cover;
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

  debugDump(): void {
    const obj: any = {};
    this.map.forEach((ten, code) => {
      const name = 負担区分コードNameOf(code);
      obj[name] = ten;
    });
    console.log(JSON.stringify(obj));
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

  debugDump(): void {
    console.log("total cover slot "); this.slot.debugDump();
    console.log("total cover tens"); this.tens.debugDump();
    console.log("total cover patient charge"); this.patientChargeMap.debugDump();
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

export interface CalcFutanOptions {
  isBirthdayMonth75?: true;
  gendogaku?: {
    kingaku: number;
    kouhiBangou: number; // 1-based
  },
  marucho?: 10000 | 20000 | undefined; // value specifies gendogaku (10000 or 20000)
  debug?: boolean;


  gendogakuTasuuGaitou?: true;
  shotokuKubunGroup?: ShotokuKubunGroup;
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
        const hokenCover = processHoken({
          totalTen,
          futanWari,
          shotokuKubun,
          iryouKingaku: totalTen * 10,
          prevPatientCharge: resolvePrevPatientCharge(curTotalCover, prevCover, futanWari, shotokuKubun, opt.shotokuKubunGroup),
          hasKuniKouhi: curKouhiList.findIndex(k => isKuniKouhi2(k.houbetsu, k.futanshaBangou)) >= 0,
          isTasuuGaitou: opt.gendogakuTasuuGaitou ?? false,
          shotokuKubunGroup: opt.shotokuKubunGroup,
          isBirthdayMonth75: opt.isBirthdayMonth75,
          marucho: opt.marucho,
          debug: opt.debug,
        });
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
      console.log("leave futanKubun", 負担区分コードNameOf(futanKubun));
      curTotalCover.debugDump();
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
    const tc = calcFutanOne(futanWari, shotokuKubun, kouhiList, new TotalTens(totalTens), totalCover, opt);
    totalCover.merge(tc);
  })
  return totalCover;
}

function findGendo(opt: CalcFutanOptions, sel: KouhiSelector): number | undefined { // for Nanbyou
  const kouhiBangou = parseInt(sel);
  if (opt.gendogaku && opt.gendogaku.kouhiBangou === kouhiBangou) {
    return opt.gendogaku.kingaku;
  }
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

function resolvePrevPatientCharge(curTotalCover: TotalCover, prevTotalCover: TotalCover,
  futanWari: number, shotokuKubun: ShotokuKubun | undefined, shotokuKubunGroup: ShotokuKubunGroup | undefined): number {
  let combine: boolean | undefined = undefined;
  if (shotokuKubun) {
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
      case "低所得Ⅰ（境）": {
        combine = true;
        break;
      }
    }
  }
  if (combine === undefined) {
    if (shotokuKubunGroup === "高齢受給" || shotokuKubunGroup === "後期高齢") {
      combine = true;
    }
  }
  if (combine === undefined) {
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
    combine = hokenOnlyTen * futanWari > 21000 && kouhiHeiyouTen * futanWari > 21000;
  }
  let pcm = PatientChargeMap.mergeAll(curTotalCover.patientChargeMap, prevTotalCover.patientChargeMap);
  if (combine) {
    return pcm.sum;
  } else {
    return pcm.map.get(負担区分コード["H"]) ?? 0;
  }
}