import { Shahokokuho, type Kouhi, type Koukikourei } from "myclinic-model";

export class InitialCharge {
  readonly isInitialCharge = true;
  value: number;

  constructor(value: number) {
    this.value = value;
  }
}

export class HokenCover {
  readonly isHokenCover = true;
  futanWari: number;

  constructor(futanWari: number) {
    this.futanWari = futanWari;
  }
}

export type RezeptChargeHistory = InitialCharge | HokenCover | "madoguchi-rounding" ;

export class RezeptCharge {
  charge: number;
  history: RezeptChargeHistory[] = [];

  constructor(charge: number, history: RezeptChargeHistory[]) {
    this.charge = charge;
    this.history = history;
  }

  processed(newCharge: number, h: RezeptChargeHistory): RezeptCharge {
    return new RezeptCharge(newCharge, this.extendedHistory(h));
  }

  static create(initialCharge: number): RezeptCharge {
    return new RezeptCharge(initialCharge, [new InitialCharge(initialCharge)]);
  }

  extendedHistory(h: RezeptChargeHistory): RezeptChargeHistory[] {
    return [...this.history, h];
  }
}

function applyHoken(rc: RezeptCharge, futanWari: number): RezeptCharge {
  const newCharge = rc.charge * futanWari / 10.0;
  const newHistory = rc.extendedHistory(new HokenCover(futanWari));
  return new RezeptCharge(newCharge, newHistory);
}

export function roundKingaku(kingaku: number): number {
  return Math.round(kingaku / 10.0) * 10;
}

function applyRound(rc: RezeptCharge): RezeptCharge {
  return rc.processed(roundKingaku(rc.charge), "madoguchi-rounding");
}

function futanWariOfHoken(hoken: Shahokokuho | Koukikourei): number {
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

export function calcMadoguchiFutan(
  totalTen: number,
  hoken: Shahokokuho | Koukikourei | undefined,
  kouhiList: Kouhi[]
): RezeptCharge {
  let rc = RezeptCharge.create(totalTen * 10);
  if( hoken ){
    rc = applyHoken(rc, futanWariOfHoken(hoken));
  }
  rc = applyRound(rc);
  return rc;
}

