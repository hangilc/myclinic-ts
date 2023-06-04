import { Shahokokuho, VisitEx, type Kouhi, type Koukikourei } from "myclinic-model";

export function futanWariOfHoken(hoken: Shahokokuho | Koukikourei): number {
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
  charge: number;
  futanWari: number;
  gendogakuReached?: number;
}

export function applyHoken(
  charge: number,
  hoken: Shahokokuho | Koukikourei,
  accFutan: number,
  gendogaku: number | undefined
): HokenCover {
  const futanWari = futanWariOfHoken(hoken);
  let remCharge = charge * futanWari / 10;
  let gendogakuReached: number | undefined = undefined;
  if (gendogaku !== undefined) {
    if (remCharge + accFutan > gendogaku) {
      remCharge = gendogaku - accFutan;
      if (remCharge < 0) {
        remCharge = 0;
      }
      gendogakuReached = gendogaku;
    }
  }
  return {
    charge: remCharge,
    futanWari,
    gendogakuReached,
  }
}

export interface KouhiCover {
  charge: number;
  futanWari?: number;
  gendogakuReached?: number;
  unsupported?: boolean;
  warningMessage?: string;
}

export function applyKouhi(charge: number, kouhi: Kouhi, accMadoguchiFutan: number, accKouhiCover: number): KouhiCover {
  const futansha = kouhi.futansha;
  switch (futansha) {
    case 82134008: { // 被爆者の子に対する医療
      return {
        charge: 0,
        futanWari: 0,
      }
    }
    case 82137670:
    case 82137530: { // 大気汚染関連疾病（負担あり）
      const gendogaku = 6000;
      let gendogakuReached: number | undefined = undefined;
      if (charge + accMadoguchiFutan > gendogaku) {
        charge = gendogaku - accMadoguchiFutan;
        if (charge < 0) {
          charge = 0;
        }
        gendogakuReached = gendogaku;
      }
      return {
        charge: charge,
        gendogakuReached,
      }
    }
    default: {
      return {
        charge: 0,
        unsupported: true,
        warningMessage: `法別番号：${futansha}`,
      }
    }
  }
}

export function applyRounding(charge: number): number {
  return Math.round(charge / 10.0) * 10.0;
}


