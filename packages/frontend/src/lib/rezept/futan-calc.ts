import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { 負担区分コードRev, type 負担区分コードCode } from "./codes";
import { futanWariOfHoken } from "./util";
import { gendogakuOfKubun } from "@/lib/gendogaku";

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

interface KouhiProcessorArg {
  kakari: number;
  totalTen: number;
  hokenFutanWari: number | undefined;
  prevPatientCharge: number;
}

type KouhiProcessor = (arg: KouhiProcessorArg) => KouhiCover;

class KouhiData {
  processor: KouhiProcessor;
  isNoFutan: boolean = false;

  constructor(processor: KouhiProcessor) {
    this.processor = processor;
  }

  modify(modifier: (self: KouhiData) => void): KouhiData {
    modifier(this);
    return this;
  }
}

const NoFutanKouhi: KouhiData = new KouhiData(({ kakari }: KouhiProcessorArg) => ({ kakari, patientCharge: 0 }))
  .modify(d => d.isNoFutan = true)

const HibakushaNoKo: KouhiData = NoFutanKouhi;

function applyGendogaku(charge: number, prevCharge: number, gendogaku: number): [number, true | undefined] {
  if (charge + prevCharge > gendogaku) {
    return [gendogaku - prevCharge, true]
  } else {
    return [charge, undefined];
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
  return new KouhiData(processor);
}

const MaruAoFutanNashi: KouhiData = NoFutanKouhi;

function processHoken(
  totalTen: number,
  futanWari: number,
  gendogaku: number | undefined,
  accPatientCharge: number
): HokenCover {
  let patientCharge: number = totalTen * futanWari;
  return {
    kakari: totalTen * 10,
    patientCharge,
    futanWari,
  }
}

export type ShotokuKubun = LimitApplicationCertificateClassificationFlagLabel;
export type TotalCover = Map<負担区分コードCode, [HokenCover | undefined, KouhiCover[]]>;

function prevPatientChargeOf(code: "H" | "0" | "1" | "2" | "3" | "4", totalCover: TotalCover): number {
  for(let futanCode of totalCover.keys()){
    if( futanCode.includes(code) ){
      const [hokenCover, kouhiCovers] = totalCover.get(futanCode)!;
      return (hokenCover?.patientCharge ?? 0) +
        kouhiCovers.reduce((acc, ele) => acc + (ele?.patientCharge ?? 0), 0);
    }
  }
}

export function calcFutanOne(
  futanWari: number | undefined,
  shotokuKubun: ShotokuKubun | undefined,
  kouhiList: KouhiProcessor[],
  totalTens: Map<負担区分コードCode, number>,
  prevCover: TotalCover | undefined,
): TotalCover {
  const futanKubuns: 負担区分コードCode[] = sortFutanKubun(Array.from(totalTens.keys()));
  throw new Error("Not implemented");
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

function kubunToKouhiList(kubun: 負担区分コードCode, kouhiList: KouhiProcessor[]):
  KouhiProcessor[] {
  const ks: KouhiProcessor[] = [];
  kubun.split("").forEach((k) => {
    if (k !== "H") {
      const i = parseInt(k);
      ks.push(kouhiList[i - 1]);
    }
  });
  return ks;
}