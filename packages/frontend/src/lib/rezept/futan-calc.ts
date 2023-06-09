import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { 負担区分コードNameOf, 負担区分コードRev, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { gendogakuOfHeiryoSochiBirthdayMonth, gendogakuOfKubunOpt, isKuniKouhiOfHeiyou } from "@/lib/gendogaku";
import { mergeOptions, optionFold } from "../option";
import { resolve } from "path";

interface Cover {
  kakari: number;
  patientCharge: number;
}

function mergeCovers(a: Cover, b: Cover): Cover {
  return {
    kakari: a.kakari + b.kakari,
    patientCharge: a.patientCharge + b.patientCharge,
  }
}

interface HokenCover extends Cover {
  futanWari: number;
  gendogakuReached?: true;
  maruchoGendogakuReached?: 10000 | 20000 | undefined;
}

function mergeHokenCovers(a: HokenCover, b: HokenCover): HokenCover {
  if (a.futanWari !== b.futanWari) {
    throw new Error("Inconsistent futan wari");
  }
  const cover = mergeCovers(a, b);
  return {
    ...cover,
    futanWari: a.futanWari,
    gendogakuReached: mergeOptions(a.gendogakuReached, b.gendogakuReached, (a, b) => a || b),
    maruchoGendogakuReached: mergeOptions(
      a.maruchoGendogakuReached,
      b.maruchoGendogakuReached,
      (a, b) => {
        if (a !== b) {
          throw new Error("Inconsistent マル長限度額");
        }
        return a;
      }
    )
  }
}

interface KouhiCover extends Cover {
  gendogakuReached?: true;
}

function mergeKouhiCovers(a: KouhiCover, b: KouhiCover): KouhiCover {
  const cover = mergeCovers(a, b);
  return {
    ...cover,
    gendogakuReached: mergeOptions(a.gendogakuReached, b.gendogakuReached, (a, b) => a || b),
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
  hokenCover: HokenCover | undefined;
  kouhiCovers: (KouhiCover | undefined)[] = [];

  constructor(hokenCover: HokenCover | undefined, kouhiCovers: (KouhiCover | undefined)[]) {
    this.hokenCover = hokenCover;
    this.kouhiCovers = kouhiCovers;
  }

  coverOf(sel: HokenSelector): Cover | undefined {
    if (sel === "H") {
      return this.hokenCover;
    } else {
      return this.kouhiCovers[kouhiSelectorToIndex(sel)];
    }
  }

  patientChargeOf(sel: HokenSelector): number {
    return coverOptFold(this.coverOf(sel), c => c.patientCharge, 0);
  }

  kakariOf(sel: HokenSelector): number {
    return coverOptFold(this.coverOf(sel), c => c.kakari, 0);
  }

  get patientCharge(): number {
    const ks: KouhiCover[] = [];
    this.kouhiCovers.forEach(k => {
      if (k !== undefined) {
        ks.push(k);
      }
    })
    if (ks.length === 0) {
      if (this.hokenCover === undefined) {
        throw new Error("No hoken, no kouhi");
      }
      return this.hokenCover.patientCharge;
    } else {
      return ks[ks.length - 1].patientCharge;
    }
  }

  merge(other: Slot): Slot {
    if (this.kouhiCovers.length !== other.kouhiCovers.length) {
      throw new Error("Inconsitent kouhi covers length");
    }
    return new Slot(
      mergeOptions(this.hokenCover, other.hokenCover, mergeHokenCovers),
      this.kouhiCovers.map((kc, index) => mergeOptions(kc, other.kouhiCovers[index], mergeKouhiCovers)),
    );
  }

  static NullSlot(kouhiListLength: number): Slot {
    return new Slot(undefined, Array<KouhiCover | undefined>(kouhiListLength).fill(undefined));
  }
}

interface KouhiProcessorArg {
  kakari: number;
  totalTen: number;
  hokenFutanWari: number | undefined;
  prevPatientCharge: number;
  gendogakuApplied: number | undefined;
}

type KouhiProcessor = (arg: KouhiProcessorArg) => KouhiCover;

class KouhiData {
  houbetsu: number;
  processor: KouhiProcessor;
  isNoFutan: boolean = false;
  hasGendogaku: boolean = false;

  constructor(houbetsu: number, processor: KouhiProcessor, modifier: (d: KouhiData) => void = _ => { }) {
    this.houbetsu = houbetsu;
    this.processor = processor;
    modifier(this);
  }
}

function noFutanKouhiProcessor({ kakari }: KouhiProcessorArg): KouhiCover {
  return {
    kakari,
    patientCharge: 0,
  }
}

function applyGendogaku(charge: number, prevCharge: number, gendogaku: number | undefined): [number, true | undefined] {
  if (gendogaku === undefined) {
    return [charge, undefined];
  } else {
    if (charge + prevCharge > gendogaku) {
      return [gendogaku - prevCharge, true]
    } else {
      return [charge, undefined];
    }
  }
}

function mkGendogakuLimitProcessor(gendogaku: number): KouhiProcessor {
  return ({ kakari, prevPatientCharge }: KouhiProcessorArg): KouhiCover => {
    const [patientCharge, gendogakuReached] = applyGendogaku(kakari, prevPatientCharge, gendogaku);
    return {
      kakari,
      patientCharge,
      gendogakuReached,
    }
  }
}

export const HibakushaNoKo: KouhiData = new KouhiData(82, noFutanKouhiProcessor, d => d.isNoFutan = true);


// マル都（大気汚染）
export function MaruToTaikiosen(gendogaku: number): KouhiData {;
  return new KouhiData(82, mkGendogakuLimitProcessor(gendogaku), d => d.hasGendogaku = true)
}

// マル青
export const MaruAoNoFutan: KouhiData = new KouhiData(89, noFutanKouhiProcessor, d => d.isNoFutan = true);

// マル都（難病）
export const MarutoNanbyou: KouhiData = new KouhiData(82,
  ({
    kakari, totalTen, hokenFutanWari, prevPatientCharge, gendogakuApplied
  }: KouhiProcessorArg) => {
    let patientCharge = kakari;
    let gendogakuReached: true | undefined = undefined;
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
  },
  d => d.hasGendogaku = true
);

function processHoken(
  totalTen: number,
  futanWari: number,
  gendogaku: number | undefined,
  prevPatientCharge: number
): HokenCover {
  const [patientCharge, gendogakuReached] = applyGendogaku(
    totalTen * futanWari,
    prevPatientCharge,
    gendogaku
  );
  return {
    kakari: totalTen * 10,
    patientCharge,
    futanWari,
    gendogakuReached,
  }
}

export type ShotokuKubun = LimitApplicationCertificateClassificationFlagLabel;
export interface TotalCoverInterface {
  patientChargeOf(code: HokenSelector): number;
  kakariOf(code: HokenSelector): number;
};

export class TotalCover implements TotalCoverInterface {
  map: Map<負担区分コードCode, Slot>;

  constructor(map?: Map<負担区分コードCode, Slot>) {
    this.map = map ?? new Map();
  }

  setSlot(futanCode: 負担区分コードCode, slot: Slot): void {
    this.map.set(futanCode, slot);
  }

  get accHokenCover(): HokenCover | undefined {
    return Array.from(this.map.entries())
      .reduce((acc: HokenCover | undefined, [_, slot]) => {
        return mergeOptions(acc, slot.hokenCover, mergeHokenCovers);
      }, undefined);
  }

  accKouhiCover(sel: KouhiSelector, kouhiList: KouhiData[]): KouhiCover | undefined {
    const index = kouhiSelectorToIndex(sel);
    return Array.from(this.map.entries())
      .reduce((acc: KouhiCover | undefined, [_, slot]) => {
        return mergeOptions(acc, slot.kouhiCovers[index], mergeKouhiCovers);
      }, undefined);
  }

  reduceByCodeGeneric<T>(code: HokenSelector, f: (acc: T, cover: Cover) => T, init: T): T {
    return Array.from(this.map.entries())
      .reduce((acc, [_, slot]) => {
        const cover = slot.coverOf(code);
        if (cover) {
          return f(acc, cover);
        } else {
          return acc;
        }
      }, init);
  }

  reduceByCode(code: HokenSelector, f: (cover: Cover) => number): number {
    return this.reduceByCodeGeneric<number>(code, ((acc, ele) => acc + f(ele)), 0);
  }

  patientChargeOf(code: HokenSelector): number {
    return this.reduceByCode(code, c => c.patientCharge);
  }

  kakariOf(code: HokenSelector): number {
    return this.reduceByCode(code, c => c.kakari);
  }

  merge(other: TotalCover): TotalCover {
    const newMap: Map<負担区分コードCode, Slot> = new Map(this.map);
    Array.from(other.map.entries()).forEach(([kubun, slot]) => {
      const prev: Slot | undefined = newMap.get(kubun);
      if (prev === undefined) {
        newMap.set(kubun, slot);
      } else {
        newMap.set(kubun, prev.merge(slot));
      }
    });
    return new TotalCover(newMap);
  }

  get patientCharge(): number {
    return Array.from(this.map.values()).reduce((acc, ele) => acc + ele.patientCharge, 0);
  }

  static NullTotalCover(): TotalCover {
    return new TotalCover();
  }
}

function mapTotalTens(
  totalTens: Map<負担区分コードCode, number>,
  f: (futanKubun: 負担区分コードCode, totalTen: number, curTotalCover: TotalCover) => Slot
): TotalCover {
  const totalCover = new TotalCover();
  const futanKubuns: 負担区分コードCode[] = sortFutanKubun(Array.from(totalTens.keys()));
  console.log(futanKubuns);
  for (let futanKubun of futanKubuns) {
    const slot = f(futanKubun, totalTens.get(futanKubun)!, totalCover);
    totalCover.setSlot(futanKubun, slot);
  }
  return totalCover;
}

function totalTenOf(selector: HokenSelector, totalTens: Map<負担区分コードCode, number>): number {
  return Array.from(totalTens.entries()).reduce((acc: number, ele) => {
    const [futanKubun, totalTen] = ele;
    const futanName = 負担区分コードNameOf(futanKubun);
    if (futanNameIncludes(futanName, selector)) {
      return totalTen;
    } else {
      return 0;
    }
  }, 0);
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

function resolveShotokuKubun(futanKubun: 負担区分コードCode, kouhiList: KouhiData[], supplied: ShotokuKubun | undefined)
  : ShotokuKubun | "ext国公費" | undefined {
  const ks = kouhiListOfKubun(futanKubun, kouhiList);
  if (isKuniKouhiOfHeiyou(ks.map(kd => kd.houbetsu))) {
    return "ext国公費"
  } else {
    return supplied;
  }
}

export interface CalcFutanOpt {
  isBirthdayMonth75?: true;
  gendogaku?: {
    kingaku: number;
    kouhiBangou: number; // 1-based
  },
  marucho?: 10000 | 20000 | undefined; // value specifies gendogaku (10000 or 20000)
  debug?: boolean;
}

export function calcFutanOne(
  futanWari: number | undefined,
  shotokuKubun: ShotokuKubun | undefined,
  kouhiList: KouhiData[],
  totalTens: Map<負担区分コードCode, number>,
  prevCover: TotalCover,
  opt: CalcFutanOpt = {},
): TotalCover {
  if (opt.debug) {
    console.log(`enter calcFutanOne, futanWari: ${futanWari}`);
    console.log("kouhiList", kouhiList);
  }
  const cur = mapTotalTens(totalTens, (futanKubun, totalTen, curTotalCover) => {
    if (opt.debug) {
      console.log("futanKubun", 負担区分コードRev.get(futanKubun));
    }
    const curKouhiList: KouhiData[] = kouhiListOfKubun(futanKubun, kouhiList);
    let kakari: number = totalTen * 10;
    const slot = Slot.NullSlot(kouhiList.length);
    curTotalCover.setSlot(futanKubun, slot);
    const selectors = splitFutanKubun(futanKubun);
    for (let sel of selectors) {
      if (sel === "H") {
        if (futanWari === undefined) {
          throw new Error("Cannot find futanWari");
        }
        let resolvedShotokuKubun = resolveShotokuKubun(futanKubun, kouhiList, shotokuKubun);
        if( resolvedShotokuKubun === "一般Ⅱ" && hairyosochiNotApplicable(opt, curKouhiList, prevCover) ){
          resolvedShotokuKubun = undefined;
        }
        if (opt.debug) {
          console.log(`所得区分: ${resolvedShotokuKubun}`)
        }
        const iryouKingaku = (totalTen * 10) + (prevCover.map.get(futanKubun)?.hokenCover?.kakari ?? 0);
        let gendogaku: number | undefined = undefined;
        if (opt.isBirthdayMonth75) {
          if (resolvedShotokuKubun === "一般Ⅱ") {
            gendogaku = gendogakuOfHeiryoSochiBirthdayMonth(iryouKingaku);
          } else {
            gendogaku = gendogakuOfKubunOpt(
              resolvedShotokuKubun,
              iryouKingaku
            );
            if (gendogaku !== undefined) {
              gendogaku /= 2.0;
            }
          }
        } else {
          gendogaku = gendogakuOfKubunOpt(
            resolvedShotokuKubun,
            iryouKingaku
          );
        }
        if (opt.debug) {
          console.log(`限度額: ${gendogaku}`);
        }
        slot.hokenCover = processHoken(totalTen, futanWari, gendogaku, prevCover.patientChargeOf(sel))
        kakari = slot.hokenCover.patientCharge;
        if (opt.marucho) {
          const maruchoGendo = opt.marucho;
          const hokenCover = slot.hokenCover;
          if (hokenCover === undefined) {
            throw new Error("マル長を適用する保険がない");
          }
          const accHokenCover = mergeOptions(hokenCover, prevCover.accHokenCover, mergeHokenCovers)!;
          if (accHokenCover.maruchoGendogakuReached) {
            hokenCover.patientCharge = 0;
          } else {
            if (accHokenCover.patientCharge > maruchoGendo) {
              hokenCover.patientCharge = maruchoGendo - prevCover.patientChargeOf("H");
              hokenCover.maruchoGendogakuReached = maruchoGendo;
            }
          }
        }
      } else {
        const index = kouhiSelectorToIndex(sel);
        const kouhiData = kouhiList[index];
        const kouhiCover = kouhiData.processor({
          kakari,
          totalTen,
          hokenFutanWari: futanWari,
          prevPatientCharge: curTotalCover.patientChargeOf(sel) + prevCover.patientChargeOf(sel),
          gendogakuApplied: findGendo(opt, sel),
        });
        slot.kouhiCovers[index] = kouhiCover;
        kakari = kouhiCover.patientCharge;
      }
    }
    return slot;
  });
  return prevCover.merge(cur);
}

export function calcFutan(
  futanWari: number | undefined,
  shotokuKubun: ShotokuKubun | undefined,
  kouhiList: KouhiData[],
  totalTensList: Map<負担区分コードCode, number>[], // in chronological order (new one is before old one)
  opt: CalcFutanOpt = {},
): TotalCover {
  if (totalTensList.length === 0) {
    throw new Error("Empty total tens list");
  }
  let totalCover: TotalCover =
    calcFutanOne(futanWari, shotokuKubun, kouhiList, totalTensList[0], TotalCover.NullTotalCover(), opt);
  for (let i = 1; i < totalTensList.length; i++) {
    totalCover = calcFutanOne(futanWari, shotokuKubun, kouhiList, totalTensList[i], totalCover, opt)
  }
  return totalCover;
}

function findGendo(opt: CalcFutanOpt, sel: KouhiSelector): number | undefined { // for Nanbyou
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
      ks.push(allKouhiList[i - 1]);
    }
  });
  return ks;
}

function hairyosochiNotApplicable(opt: CalcFutanOpt, kouhiList: KouhiData[], prevCover: TotalCover): boolean {
  if( opt.marucho ){
    return true;
  }
  for(let kouhi of kouhiList ){
    if( kouhi.hasGendogaku ) {
      return true;
    }
  }
  if( prevCover.accHokenCover?.maruchoGendogakuReached ) {
    return true;
  }
  return false;
}