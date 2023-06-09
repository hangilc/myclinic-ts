import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { 負担区分コードNameOf, 負担区分コードRev, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { gendogakuOfKubun, gendogakuTasuuGaitouOfKubun, isKuniKouhi, isKuniKouhiOfHeiyou, kuniKouhiHeiyouGendogaku } from "@/lib/gendogaku";
import { mergeOptions, optionFold } from "../option";

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
  hokenCover: Cover | undefined;
  kouhiCovers: (Cover | undefined)[] = [];

  constructor(hokenCover: Cover | undefined, kouhiCovers: (Cover | undefined)[]) {
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
    const ks: Cover[] = [];
    this.kouhiCovers.forEach(c => {
      if( c !== undefined ){
        ks.push(c);
      }
    });
    if( ks.length === 0 ){
      return this.hokenCover?.patientCharge ?? 0;
    } else {
      return ks[ks.length-1].patientCharge;
    }
  }

  merge(other: Slot): Slot {
    if (this.kouhiCovers.length !== other.kouhiCovers.length) {
      throw new Error("Inconsitent kouhi covers length");
    }
    return new Slot(
      mergeOptions(this.hokenCover, other.hokenCover, mergeCovers),
      this.kouhiCovers.map((kc, index) => mergeOptions(kc, other.kouhiCovers[index], mergeCovers)),
    );
  }

  static NullSlot(kouhiListLength: number): Slot {
    return new Slot(undefined, Array<Cover | undefined>(kouhiListLength).fill(undefined));
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

export const HibakushaNoKo: KouhiData = new KouhiData(82, noFutanKouhiProcessor, d => d.isNoFutan = true);


// マル都（大気汚染）
export function MaruToTaikiosen(gendogaku: number): KouhiData {
  ;
  return new KouhiData(82, mkGendogakuLimitProcessor(gendogaku), d => d.hasGendogaku = true)
}

// マル青
export const MaruAoNoFutan: KouhiData = new KouhiData(89, noFutanKouhiProcessor, d => d.isNoFutan = true);

// マル都（難病）
export const MarutoNanbyou: KouhiData = new KouhiData(82,
  (arg: KouhiProcessorArg) => {
    if( arg.debug ){
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
  },
  d => d.hasGendogaku = true
);

// function processHokenOrig(
//   totalTen: number,
//   futanWari: number,
//   gendogaku: number | undefined,
//   prevPatientCharge: number
// ): HokenCover {
//   const [patientCharge, gendogakuReached] = applyGendogaku(
//     totalTen * futanWari,
//     prevPatientCharge,
//     gendogaku
//   );
//   return {
//     kakari: totalTen * 10,
//     patientCharge,
//     futanWari,
//     gendogakuReached,
//   }
// }

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
    if (hasKuniKouhi) {
      let sk: ShotokuKubun;
      if (shotokuKubun) {
        sk = shotokuKubun;
      } else {
        if (!shotokuKubunGroup) {
          throw new Error("Cannot resolve shotoku kubun group");
        }
        sk = defaultKuniKouhiShotokuKubun(shotokuKubunGroup);
      }
      return kuniKouhiHeiyouGendogaku(sk, iryouKingaku);
    } else if (shotokuKubun === undefined) {
      return undefined;
    } else {
      if (isTasuuGaitou) {
        return gendogakuTasuuGaitouOfKubun(shotokuKubun);
      } else {
        return shotokuKubun ? gendogakuOfKubun(shotokuKubun, iryouKingaku) : undefined;
      }
    }
  }
  if (gendogakuReached) {
    return { kakari, patientCharge: 0, gendogakuReached: false };
  } else {
    if (shotokuKubun === undefined) {
      return { kakari, patientCharge: totalTen * futanWari, gendogakuReached: false };
    } else {
      let g = gendo();
      if( isBirthdayMonth75 && g !== undefined ){
        g /= 2;
      }
      const [patientCharge, gendogakuReached] = applyGendogaku(totalTen * futanWari, prevPatientCharge, g);
      return { kakari, patientCharge, gendogakuReached };
    }
  }
}

interface ProcessHokenContext extends ProcessHokenWithFixedShotokuKubunContext {
  hasKuniKouhi: boolean;
}

function mkProcessHokenContext(
  totalTen: number,
  futanWari: number,
  accHokenCover: Cover,
  shotokuKubun: ShotokuKubun | undefined,
  iryouKingaku: number,
  curKouhiList: KouhiData[],
  isTasuuGaitou: boolean,
  shotokuKubunGroup?: ShotokuKubunGroup,
  isBirthdayMonth75?: boolean,
  debug?: boolean,
): ProcessHokenContext {
  return {
    totalTen,
    futanWari,
    gendogakuReached: accHokenCover.gendogakuReached,
    shotokuKubun,
    iryouKingaku,
    prevPatientCharge: accHokenCover.patientCharge,
    hasKuniKouhi: curKouhiList.findIndex(k => isKuniKouhi(k.houbetsu)) >= 0,
    isTasuuGaitou,
    shotokuKubunGroup,
    isBirthdayMonth75,
    debug,
  }
}

function processHoken(arg: ProcessHokenContext): Cover {
  const { shotokuKubun, hasKuniKouhi, debug } = arg;
  if( debug ){
    console.log("    enter processHoken");
    console.log(`    arg: ${JSON.stringify(arg)}`);
  }
  if (shotokuKubun === undefined) {
    return processHokenWithFixedShotokuKubun(arg);
  } else if (shotokuKubun === "一般Ⅱ") { // 配慮措置
    throw new Error("Not implemented");
  } else {
    if (hasKuniKouhi) {
      return processHokenWithFixedShotokuKubun(Object.assign({}, arg, { shotokuKubun: "ext国公費" }));
    } else {
      return processHokenWithFixedShotokuKubun(arg);
    }
  }
}

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

  get accHokenCover(): Cover | undefined {
    return Array.from(this.map.entries())
      .reduce((acc: Cover | undefined, [_, slot]) => {
        return mergeOptions(acc, slot.hokenCover, mergeCovers);
      }, undefined);
  }

  accKouhiCover(sel: KouhiSelector, kouhiList: KouhiData[]): Cover | undefined {
    const index = kouhiSelectorToIndex(sel);
    return Array.from(this.map.entries())
      .reduce((acc: Cover | undefined, [_, slot]) => {
        return mergeOptions(acc, slot.kouhiCovers[index], mergeCovers);
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
  for (let futanKubun of futanKubuns) {
    const slot = f(futanKubun, totalTens.get(futanKubun)!, totalCover);
    totalCover.setSlot(futanKubun, slot);
  }
  return totalCover;
}

function totalTenOfSelector(selector: HokenSelector, totalTens: Map<負担区分コードCode, number>): number {
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

// function calcGendogaku(shotokuKubun: LimitApplicationCertificateClassificationFlagLabel | "ext国公費" | undefined,
//   iryouKingaku: number, isTasuuGaitou: boolean)
//   : number | undefined {
//   if (shotokuKubun === undefined) {
//     return undefined;
//   } else if (isTasuuGaitou) {
//     return gendogakuTasuuGaitouOfKubun(shotokuKubun);
//   } else {
//     return gendogakuOfKubunOpt(shotokuKubun, iryouKingaku);
//   }
// }

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
  totalTens: Map<負担区分コードCode, number>,
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
    const slot = Slot.NullSlot(kouhiList.length);
    curTotalCover.setSlot(futanKubun, slot);
    const selectors = splitFutanKubun(futanKubun);
    for (let sel of selectors) {
      if( opt.debug) {
        console.log(`  sel: ${sel}, kakari: ${kakari}`);
      }
      if (sel === "H") {
        if (futanWari === undefined) {
          throw new Error("Cannot find futanWari");
        }
        const accHokenCover = mergeOptions(curTotalCover.accHokenCover, prevCover.accHokenCover, mergeCovers) ||
          { kakari: 0, patientCharge: 0, gendogakuReached: false };
        const hokenCover = processHoken(mkProcessHokenContext(
          totalTen, futanWari, accHokenCover, shotokuKubun, totalTenOfSelector("H", totalTens) * 10, curKouhiList,
          opt.gendogakuTasuuGaitou ?? false, opt.shotokuKubunGroup, opt.isBirthdayMonth75, opt.debug,
        ));
        if( opt.debug ){
          console.log(`    hokenCover: ${JSON.stringify(hokenCover)}`)
        }
        slot.hokenCover = hokenCover;
        kakari = hokenCover.patientCharge;
        // let resolvedShotokuKubun = resolveShotokuKubun(futanKubun, kouhiList, shotokuKubun);
        // if (resolvedShotokuKubun === "一般Ⅱ" && hairyosochiNotApplicable(opt, curKouhiList, prevCover)) {
        //   resolvedShotokuKubun = undefined;
        // }
        // if (opt.debug) {
        //   console.log(`所得区分: ${resolvedShotokuKubun}`)
        // }
        // const iryouKingaku = (totalTen * 10) + (prevCover.map.get(futanKubun)?.hokenCover?.kakari ?? 0);
        // let gendogaku: number | undefined = undefined;
        // if (opt.isBirthdayMonth75) {
        //   if (resolvedShotokuKubun === "一般Ⅱ") {
        //     gendogaku = gendogakuOfHairyoSochiBirthdayMonth(iryouKingaku);
        //   } else {
        //     gendogaku = gendogakuOfKubunOpt(
        //       resolvedShotokuKubun,
        //       iryouKingaku
        //     );
        //     if (gendogaku !== undefined) {
        //       gendogaku /= 2.0;
        //     }
        //   }
        // } else {
        //   if (opt.gendogakuTasuuGaitou) {
        //     gendogaku = gendogakuTasuuGaitouOfKubun(resolvedShotokuKubun);
        //   } else {
        //     gendogaku = gendogakuOfKubunOpt(
        //       resolvedShotokuKubun,
        //       iryouKingaku
        //     );
        //   }
        // }
        // if (opt.debug) {
        //   console.log(`限度額: ${gendogaku}`);
        // }
        // slot.hokenCover = processHoken(totalTen, futanWari, gendogaku, prevCover.patientChargeOf(sel))
        // kakari = slot.hokenCover.patientCharge;
        // if (opt.marucho) {
        //   const maruchoGendo = opt.marucho;
        //   const hokenCover = slot.hokenCover;
        //   if (hokenCover === undefined) {
        //     throw new Error("マル長を適用する保険がない");
        //   }
        //   const accHokenCover = mergeOptions(hokenCover, prevCover.accHokenCover, mergeHokenCovers)!;
        //   if (accHokenCover.maruchoGendogakuReached) {
        //     hokenCover.patientCharge = 0;
        //   } else {
        //     if (accHokenCover.patientCharge > maruchoGendo) {
        //       hokenCover.patientCharge = maruchoGendo - prevCover.patientChargeOf("H");
        //       hokenCover.maruchoGendogakuReached = maruchoGendo;
        //     }
        //   }
        // }
      } else {
        const index = kouhiSelectorToIndex(sel);
        const kouhiData = kouhiList[index];
        const kouhiCover = kouhiData.processor({
          kakari,
          totalTen,
          hokenFutanWari: futanWari,
          prevPatientCharge: curTotalCover.patientChargeOf(sel) + prevCover.patientChargeOf(sel),
          gendogakuApplied: findGendo(opt, sel),
          debug: opt.debug,
        });
        if( opt.debug ){
          console.log(`    kouhiCover: ${JSON.stringify(kouhiCover)}`);
        }
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
  opt: CalcFutanOptions = {},
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
      ks.push(allKouhiList[i - 1]);
    }
  });
  return ks;
}

function hairyosochiNotApplicable(hasMarucho: boolean, kouhiList: KouhiData[]): boolean {
  return hasMarucho || kouhiList.length > 0;
}