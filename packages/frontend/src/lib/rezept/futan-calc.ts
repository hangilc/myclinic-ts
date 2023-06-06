import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { 負担区分コードRev, type 負担区分コードCode } from "./codes";
import { futanWariOfHoken } from "./util";
import { gendogakuOfKubun, isKuniKouhiOfHeiyou } from "@/lib/gendogaku";
import { optionFold } from "../option";
import { filter } from "cypress/types/bluebird";

interface Cover {
  kakari: number;
  patientCharge: number;
}

interface HokenCover extends Cover {
  futanWari: number;
  gendogakuReached?: true;
}

interface KouhiCover extends Cover {
  gendogakuReached?: true;
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

function toKouhiSelector(index: number): KouhiSelector {
  switch (index) {
    case 0: return "1";
    case 1: return "2";
    case 2: return "3";
    case 3: return "4";
    default: throw new Error("Invalid kouhi index: should be one of 0, 1, 2, or 3.");
  }
}

function kouhiSelectorToIndex(kouhiSelector: KouhiSelector): number {
  return parseInt(kouhiSelector) - 1;
}

class Slot {
  hokenCover: HokenCover | undefined = undefined;
  kouhiCovers: KouhiCover[] = [];

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
    return this.patientChargeOf("H") + this.kouhiCovers.reduce((acc, ele) => acc + ele.patientCharge, 0);
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
export type TotalCover = Map<負担区分コードCode, Slot>;

function reduceTotalCover(code: HokenSelector, f: (cover: Cover) => number, totalCover: TotalCover | undefined): number {
  if (totalCover === undefined) {
    return 0;
  }
  return Array.from(totalCover.entries())
    .reduce((acc, [_, slot]) => acc + optionFold(slot.coverOf(code), f, 0), 0);

}

function patientChargeOfTotalCover(code: HokenSelector, totalCover: TotalCover | undefined): number {
  return reduceTotalCover(code, c => c.patientCharge, totalCover);
}

function kakariOfTotalCover(code: HokenSelector, totalCover: TotalCover | undefined): number {
  return reduceTotalCover(code, c => c.kakari, totalCover);
}

export function calcFutanOne(
  futanWari: number | undefined,
  shotokuKubun: ShotokuKubun | undefined,
  kouhiList: KouhiData[],
  totalTens: Map<負担区分コードCode, number>,
  prevCover: TotalCover | undefined,
): TotalCover {
  const totalCover: TotalCover = new Map();
  const futanKubuns: 負担区分コードCode[] = sortFutanKubun(Array.from(totalTens.keys()));
  for (let futanKubun of futanKubuns) {
    let hokenCover: HokenCover | undefined = undefined;
    const kouhiCovers: KouhiCover[] = [];
    const totalTen = totalTens.get(futanKubun)!;
    const ks = kouhiListOfKubun(futanKubun, kouhiList);
    if (futanKubun.includes("H")) {
      if (futanWari !== undefined) {
        throw new Error("Cannot find futanwari");
      }
      let shotokuKubunExt: ShotokuKubun | "ext国公費" | undefined = shotokuKubun;
      if (isKuniKouhiOfHeiyou(kouhiList.map(k => k.houbetsu))) {
        shotokuKubunExt = "ext国公費";
      }
      const iryouKingaku = totalTen * 10 + prevCover?.
      const gendogaku = gendogakuOfKubun(shotokuKubunExt,)
      const prevPatientCharge = prevPatientChargeOf("H", prevCover);
      hokenCover = processHoken(totalTen, futanWari,)
    }
  }
  return totalCover;
}

export function calcFutan(
  futanWari: number | undefined,
  shotokuKubun: ShotokuKubun | undefined,
  kouhiList: KouhiProcessor[],
  totalTensList: Map<負担区分コードCode, number>[], // in chronological order (new one is before old one)
): TotalCover {
  if (totalTensList.length === 0) {
    throw new Error("Empty total tens list");
  }
  let totalCover: TotalCover = calcFutanOne(futanWari, shotokuKubun, kouhiList, totalTensList[0], undefined);
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
  kubun.split("").forEach((k) => {
    if (k !== "H") {
      const i = parseInt(k);
      ks.push(allKouhiList[i - 1]);
    }
  });
  return ks;
}