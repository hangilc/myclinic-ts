import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { 負担区分コードNameOf, 負担区分コードRev, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { mergeOptions, optionFold, optionForEach } from "../option";
import { calcGendogaku, isKuniKouhi2 } from "./gendogaku";

interface Cover {
  kakari: number;
  patientCharge: number;
  gendogakuReached: boolean;
}

function mergeCovers(a: Cover, b: Cover): Cover {
  return {
    kakari: a.kakari + b.kakari,
    patientCharge: a.patientCharge + b.patientCharge,
    gendogakuReached: a.gendogakuReached || b.gendogakuReached,
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

export class Slot {
  map: Map<HokenSelector, Cover> = new Map();
  
  coverOf(sel: HokenSelector): Cover | undefined {
    return this.map.get(sel);
  }

  patientChargeOf(sel: HokenSelector): number {
    return coverOptFold(this.coverOf(sel), c => c.patientCharge, 0);
  }

  kakariOf(sel: HokenSelector): number {
    return coverOptFold(this.coverOf(sel), c => c.kakari, 0);
  }

  get patientCharge(): number {
    let sum = 0;
    this.map.forEach(cover => sum += cover.patientCharge);
    return sum;
  }

  merge(other: Slot): void {
    other.map.forEach((cover, sel) => this.addCover(sel, cover));
  }

  clone(): Slot {
    const slot = new Slot();
    slot.merge(this);
    return slot;
  }

  addCover(sel: HokenSelector, cover: Cover): void {
    let c = optionFold(this.map.get(sel), c => mergeCovers(c, cover), cover);
    this.map.set(sel, c);
  }
}

class TotalTens {
  map: Map<負担区分コードCode, number>;

  constructor(map: Map<負担区分コードCode, number> = new Map()) {
    this.map = map;
  }

  addTen(futanCode: 負担区分コードCode, ten: number): void {
    let c = optionFold(this.map.get(futanCode), e => e + ten, 0);
    this.map.set(futanCode, c);
  }

  merge(other: TotalTens): void {
    other.map.forEach((ten, code) => this.addTen(code, ten));
  }

  get totalTen(): number {
    return Array.from(this.map.values()).reduce((a, b) => a + b, 0);
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
    patientCharge: 0,
    gendogakuReached: false,
  }
}

function applyGendogaku(charge: number, prevCharge: number, gendogaku: number | undefined): [number, boolean] {
  if (gendogaku === undefined) {
    return [charge, false];
  } else {
    if (charge + prevCharge > gendogaku) {
      return [gendogaku - prevCharge, true]
    } else {
      return [charge, false];
    }
  }
}

function mkGendogakuLimitProcessor(gendogaku: number): KouhiProcessor {
  return ({ kakari, prevPatientCharge }: KouhiProcessorArg): Cover => {
    const [patientCharge, gendogakuReached] = applyGendogaku(kakari, prevPatientCharge, gendogaku);
    return {
      kakari,
      patientCharge,
      gendogakuReached,
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
  processor: (arg: KouhiProcessorArg) => {
    if (arg.debug) {
      console.log("    enter 公費難病");
      console.log("      ", JSON.stringify(arg));
    }
    const { kakari, totalTen, hokenFutanWari, prevPatientCharge, gendogakuApplied, debug } = arg;
    let patientCharge = kakari;
    let gendogakuReached: boolean = false;
    if (gendogakuApplied !== undefined) {
      patientCharge = gendogakuApplied - prevPatientCharge;
      if (patientCharge < 0) {
        throw new Error("Cannot happen in MarutoNanbyou");
      }
      gendogakuReached = true;
    } else {
      if (hokenFutanWari === 3) {
        patientCharge -= totalTen;
      }
    }
    return {
      kakari,
      patientCharge,
      gendogakuReached,
    }
  }
}

// 結核患者の適正医療
export const KouhiKekkaku: KouhiData = {
  houbetsu: 10,
  processor: ({ kakari, totalTen }: KouhiProcessorArg): Cover => {
    return {
      kakari,
      patientCharge: totalTen * 0.5,
      gendogakuReached: false,
    }
  }
}

export type ShotokuKubun = LimitApplicationCertificateClassificationFlagLabel;

export type ShotokuKubunGroup = "若年" | "高齢受給" | "後期高齢";

interface ProcessHokenWithFixedShotokuKubunContext {
  totalTen: number;
  futanWari: number;
  gendogakuReached: boolean;
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
  totalTen, futanWari, gendogakuReached, shotokuKubun, iryouKingaku, prevPatientCharge,
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
  if (gendogakuReached) {
    return { kakari, patientCharge: 0, gendogakuReached: false };
  } else {
    const [patientCharge, gendogakuReached] = applyGendogaku(totalTen * futanWari, prevPatientCharge, gendo());
    return { kakari, patientCharge, gendogakuReached };
  }
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
  let cover: Cover;
  if (shotokuKubun === undefined) {
    cover = processHokenWithFixedShotokuKubun(arg);
  } else if (shotokuKubun === "一般Ⅱ") { // 配慮措置
    throw new Error("Not implemented");
  } else {
    if (hasKuniKouhi) {
      cover = processHokenWithFixedShotokuKubun(Object.assign({}, arg, { shotokuKubun: "ext国公費" }));
    } else {
      cover = processHokenWithFixedShotokuKubun(arg);
    }
  }
  if (arg.marucho !== undefined) {
    const [patientCharge, gendogakuReached] = applyGendogaku(cover.patientCharge, arg.prevPatientCharge, arg.marucho);
    cover = Object.assign({}, cover, { patientCharge, gendogakuReached });
  }
  return cover;
}

// export class TotalCover  {
//   map: Map<HokenSelector, Cover> = new Map();

//   setSlot(slot: Slot): void {
//     this.mergeCover("H", slot.hokenCover);
//     optionForEach(slot.hokenCover, this.mergeCover)
//     this.map.set(futanCode, slot);
//   }

//   mergeCover(sel: HokenSelector, cover: Cover | undefined): void {
//     if( cover === undefined ){
//       return;
//     }
//     let c = optionFold(this.map.get(sel), c => mergeCovers(c, cover), cover);
//     this.map.set(sel, c);
//   }

//   get accHokenCover(): Cover | undefined {
//     return Array.from(this.map.entries())
//       .reduce((acc: Cover | undefined, [_, slot]) => {
//         return mergeOptions(acc, slot.hokenCover, mergeCovers);
//       }, undefined);
//   }

//   accKouhiCover(sel: KouhiSelector): Cover | undefined {
//     const index = kouhiSelectorToIndex(sel);
//     return Array.from(this.map.entries())
//       .reduce((acc: Cover | undefined, [_, slot]) => {
//         return mergeOptions(acc, slot.kouhiCovers[index], mergeCovers);
//       }, undefined);
//   }

//   // reduceByCodeGeneric<T>(code: HokenSelector, f: (acc: T, cover: Cover) => T, init: T): T {
//   //   return Array.from(this.map.entries())
//   //     .reduce((acc, [_, slot]) => {
//   //       const cover = slot.coverOf(code);
//   //       if (cover) {
//   //         return f(acc, cover);
//   //       } else {
//   //         return acc;
//   //       }
//   //     }, init);
//   // }

//   // reduceByCode(code: HokenSelector, f: (cover: Cover) => number): number {
//   //   return this.reduceByCodeGeneric<number>(code, ((acc, ele) => acc + f(ele)), 0);
//   // }

//   patientChargeOf(sel: HokenSelector): number {
//     if( sel === "H" ){

//     }
//     return this.reduceByCode(code, c => c.patientCharge);
//   }

//   // kakariOf(code: HokenSelector): number {
//   //   return this.reduceByCode(code, c => c.kakari);
//   // }

//   merge(other: TotalCover): TotalCover {
//     const newMap: Map<負担区分コードCode, Slot> = new Map(this.map);
//     Array.from(other.map.entries()).forEach(([kubun, slot]) => {
//       const prev: Slot | undefined = newMap.get(kubun);
//       if (prev === undefined) {
//         newMap.set(kubun, slot);
//       } else {
//         newMap.set(kubun, prev.merge(slot));
//       }
//     });
//     return new TotalCover(newMap);
//   }

//   get patientCharge(): number {
//     return Array.from(this.map.values()).reduce((acc, ele) => acc + ele.patientCharge, 0);
//   }

//   static NullTotalCover(): TotalCover {
//     return new TotalCover();
//   }
// }

// function totalTenOfSelector(selector: HokenSelector, totalTens: Map<負担区分コードCode, number>): number {
//   return Array.from(totalTens.entries()).reduce((acc: number, ele) => {
//     const [futanKubun, totalTen] = ele;
//     const futanName = 負担区分コードNameOf(futanKubun);
//     if (futanNameIncludes(futanName, selector)) {
//       return totalTen;
//     } else {
//       return 0;
//     }
//   }, 0);
// }

export class TotalCover {
  slot: Slot = new Slot();
  tens: TotalTens = new TotalTens();

  merge(other: TotalCover): void {
    this.slot.merge(other.slot);
    this.tens.merge(other.tens);
  }

  getCover(sel: HokenSelector): Cover | undefined {
    return this.slot.map.get(sel);
  }

  addCover(sel: HokenSelector, cover: Cover) {
    this.slot.addCover(sel, cover);
  }

  get patientCharge(): number {
    return this.slot.patientCharge;
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
      console.log("futanKubun", 負担区分コードRev.get(futanKubun));
    }
    const curKouhiList: KouhiData[] = kouhiListOfKubun(futanKubun, kouhiList);
    let kakari: number = totalTen * 10;
    const selectors = splitFutanKubun(futanKubun);
    for (let sel of selectors) {
      if (opt.debug) {
        console.log(`  sel: ${sel}, kakari: ${kakari}`);
      }
      if (sel === "H") {
        if (futanWari === undefined) {
          throw new Error("Cannot find futanWari");
        }
        const accHokenCover = mergeOptions(curTotalCover.getCover("H"), prevCover.getCover("H"), mergeCovers) ||
          { kakari: 0, patientCharge: 0, gendogakuReached: false };
        const hokenCover = processHoken({
          totalTen,
          futanWari,
          gendogakuReached: accHokenCover.gendogakuReached,
          shotokuKubun,
          iryouKingaku: totalTen * 10,
          prevPatientCharge: accHokenCover.patientCharge,
          hasKuniKouhi: curKouhiList.findIndex(k => isKuniKouhi2(k.houbetsu, k.futanshaBangou)) >= 0,
          isTasuuGaitou: opt.gendogakuTasuuGaitou ?? false,
          shotokuKubunGroup: opt.shotokuKubunGroup,
          isBirthdayMonth75: opt.isBirthdayMonth75,
          marucho: opt.marucho,
          debug: opt.debug,
        });
        if (opt.debug) {
          console.log(`    hokenCover: ${JSON.stringify(hokenCover)}`)
        }
        curTotalCover.addCover("H", hokenCover);
        kakari = hokenCover.patientCharge;
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
        if (opt.debug) {
          console.log(`    kouhiCover: ${JSON.stringify(kouhiCover)}`);
        }
        curTotalCover.addCover(sel, kouhiCover);
        kakari = kouhiCover.patientCharge;
      }
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
      if( kouhiData === undefined ){
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

function canCombineGendogaku(shotokuKubun: ShotokuKubun): boolean {
  throw new Error("not implemented");
}