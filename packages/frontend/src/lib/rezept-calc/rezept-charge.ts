import { Shahokokuho, type Kouhi, type Koukikourei } from "myclinic-model";

export function futanWariOfHoken(hoken: Shahokokuho | Koukikourei): number {
  if( hoken instanceof Shahokokuho ){
    if( hoken.koureiStore > 0 ){
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

export interface KouhiCover {
  charge: number;
  futanWari?: number;
  unsupported?: boolean;
  warningMessage?: string;
}

export function applyHoken(hoken: Shahokokuho | Koukikourei, charge: number): HokenCover {
  const futanWari = futanWariOfHoken(hoken);
  return {
    charge: charge * futanWari / 10.0,
    futanWari,
  }
}

export function applyRounding(charge: number): number {
  return Math.round(charge / 10.0) * 10.0;
}
