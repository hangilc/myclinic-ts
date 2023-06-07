import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { 負担区分コードNameOf, 負担区分コードRev, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { gendogakuOfKubunOpt, isKuniKouhiOfHeiyou } from "@/lib/gendogaku";
import { mergeOptions, optionFold } from "../option";

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
  }
}

interface KouhiCover extends Cover {
  gendogakuReached?: true;
}

function mergeKouhiCover(a: KouhiCover, b: KouhiCover): KouhiCover {
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

class Slot {
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
    return (this.hokenCover?.patientCharge ?? 0) + 
      this.kouhiCovers.reduce((acc, ele) => acc + (ele?.patientCharge ?? 0), 0);
  }

  merge(other: Slot): Slot {
    if (this.kouhiCovers.length !== other.kouhiCovers.length) {
      throw new Error("Inconsitent kouhi covers length");
    }
    return new Slot(
      mergeOptions(this.hokenCover, other.hokenCover, mergeHokenCovers),
      this.kouhiCovers.map((kc, index) => mergeOptions(kc, other.kouhiCovers[index], mergeKouhiCover)),
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
}

type KouhiProcessor = (arg: KouhiProcessorArg) => KouhiCover;

class KouhiData {
  houbetsu: number;
  processor: KouhiProcessor;
  isNoFutan: boolean = false;

  constructor(houbetsu: number, processor: KouhiProcessor) {
    this.houbetsu = houbetsu;
    this.processor = processor;
  }

  modify(modifier: (self: KouhiData) => void): KouhiData {
    modifier(this);
    return this;
  }
}

function noFutanKouhiData(houbetsu: number): KouhiData {
  const process: (arg: KouhiProcessorArg) => KouhiCover = ({ kakari }: KouhiProcessorArg) => ({ kakari, patientCharge: 0 });
  const data = new KouhiData(houbetsu, process);
  data.isNoFutan = true;
  return data;
}
const HibakushaNoKo: KouhiData = noFutanKouhiData(82);

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

function taikiosenProcessor(gendogaku: number): KouhiData {
  const processor = ({ kakari, prevPatientCharge }: KouhiProcessorArg) => {
    const [patientCharge, gendogakuReached] = applyGendogaku(kakari, prevPatientCharge, gendogaku);
    return {
      kakari,
      patientCharge,
      gendogakuReached,
    }
  };
  return new KouhiData(82, processor);
}

const MaruAoNoFutan: KouhiData = noFutanKouhiData(89)

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

  reduceByCode(code: HokenSelector, f: (cover: Cover) => number): number {
    return Array.from(this.map.entries())
      .reduce((acc, [_, slot]) => acc + optionFold(slot.coverOf(code), f, 0), 0);
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

export function calcFutanOne(
  futanWari: number | undefined,
  shotokuKubun: ShotokuKubun | undefined,
  kouhiList: KouhiData[],
  totalTens: Map<負担区分コードCode, number>,
  prevCover: TotalCover,
): TotalCover {
  const cur = mapTotalTens(totalTens, (futanKubun, totalTen, curTotalCover) => {
    const slot = Slot.NullSlot(kouhiList.length);
    for (let sel of splitFutanKubun(futanKubun)) {
      if (sel === "H") {
        const gendogaku = gendogakuOfKubunOpt(
          resolveShotokuKubun(futanKubun, kouhiList, shotokuKubun),
          (totalTen * 10) + (prevCover.map.get(futanKubun)?.hokenCover?.kakari ?? 0)
        );
        if (futanWari === undefined) {
          throw new Error("Cannot find futanWari");
        }
        slot.hokenCover = processHoken(totalTen, futanWari, gendogaku, prevCover.patientChargeOf(sel))
      } else {
        const index = kouhiSelectorToIndex(sel);
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
): TotalCover {
  if (totalTensList.length === 0) {
    throw new Error("Empty total tens list");
  }
  let totalCover: TotalCover = calcFutanOne(futanWari, shotokuKubun, kouhiList, totalTensList[0], TotalCover.NullTotalCover());
  for (let i = 1; i < totalTensList.length; i++) {
    totalCover = calcFutanOne(futanWari, shotokuKubun, kouhiList, totalTensList[i], totalCover)
  }
  return totalCover;
}

function sortFutanKubun(kubuns: 負担区分コードCode[]): 負担区分コードCode[] {
  kubuns.sort(kubun => -負担区分コードRev.get(kubun)!.length);
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