import { Shahokokuho, VisitEx, type Kouhi, type Koukikourei } from "myclinic-model";

function futanWariOfHoken(hoken: Shahokokuho | Koukikourei): number {
  if (hoken instanceof Shahokokuho) {
    if (hoken.koureiStore > 0) {
      return hoken.koureiStore;
    } else {
      return 3;
    }
  } else {
    return hoken.futanWari;
  }
}

export interface HokenCover {
  totalTen: number;
  futanWari: number;
  charge: number;
  gendogakuReached: boolean;
}

export function calcHokenCover(
  totalTen: number,
  hoken: Shahokokuho | Koukikourei,
  gendogaku: number | undefined
): HokenCover {
  const futanWari = futanWariOfHoken(hoken);
  let charge = totalTen * futanWari;
  let gendogakuReached = false;
  if (gendogaku !== undefined) {
    if (charge > gendogaku) {
      charge = gendogaku;
    }
    gendogakuReached = true;
  }
  return {
    totalTen,
    futanWari,
    charge,
    gendogakuReached,
  }
}


export interface KouhiCover {
  totalTen: number;
  charge: number;
  gendogakuReached?: true;
  unsupported?: boolean;
  warningMessage?: string;
}

function gendogakuCover(totalTen: number, charge: number, gendogaku: number): KouhiCover {
  let gendogakuReached: true | undefined = undefined;
  if (charge > gendogaku) {
    charge = gendogaku;
    gendogakuReached = true;
  }
  return {
    totalTen,
    charge,
    gendogakuReached,
  }
}

export function calcKouhiCover(
  totalTen: number,
  charge: number,
  kouhi: Kouhi
): KouhiCover {
  const futansha = kouhi.futansha;
  switch (futansha) {
    case 82134008: { // 被爆者の子に対する医療
      return {
        totalTen,
        charge: 0,
      }
    }
    case 82137670:
    case 82137530: { // 大気汚染関連疾病（負担あり）
      return gendogakuCover(totalTen, charge, 6000);
    }
    default: break;
  }
  const pre5 = Math.floor(futansha / 1000);
  switch (pre5) {
    case 89131:
    case 89134: { // マル青（負担あり）
      return gendogakuCover(totalTen, charge, 200);
    }
  }
  return {
    totalTen,
    charge: 0,
    unsupported: true,
    warningMessage: `未対応の法別番号 (${kouhi.futansha})`,
  }
}

export function applyRounding(charge: number): number {
  return Math.round(charge / 10.0) * 10.0;
}


