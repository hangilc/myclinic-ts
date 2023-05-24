export class HokenCharge {
  totalTen: number;
  futanWari: number;  // uncovered futan-wari (usually 3)
  futan: number;
  isKourei2WariHairyoSochi: boolean;

  constructor({
    totalTen, futanWari, gendogaku, isKourei2WariHairyoSochi
  }: {
    totalTen: number;
    futanWari: number;
    gendogaku?: number;
    isKourei2WariHairyoSochi?: boolean;
  }) {
    this.totalTen = totalTen;
    this.futanWari = futanWari;
    this.futan = totalTen * futanWari;
    if (gendogaku !== undefined && gendogaku < this.futan) {
      this.futan = gendogaku;
    }
    this.isKourei2WariHairyoSochi = isKourei2WariHairyoSochi ?? false;
  }

  get isGendogakuApplied(): boolean {
    return this.totalTen * this.futanWari > this.futan;
  }
}

export class RezeptCharge {
  constructor(
    public hokenCharge: HokenCharge | undefined,
    public futan: number,
  ) { }

  modifyFutan(newFutan: number): RezeptCharge {
    return new RezeptCharge(this.hokenCharge, newFutan);
  }

  static fromHokenCharge(hokenCharge: HokenCharge): RezeptCharge {
    return new RezeptCharge(hokenCharge, hokenCharge.futan);
  }
}

export type KouhiCalc = (charge: RezeptCharge) => RezeptCharge;

export function calcMadoguchiFutan(totalTen: number, futanWari: number, kouhiCalcs: KouhiCalc[], opts: {

} = {}): number {
  const init = new HokenCharge({
    totalTen, futanWari
  });
  let rc = RezeptCharge.fromHokenCharge(init);
  kouhiCalcs.forEach(kcalc => {
    rc = kcalc(rc);
  });
  const futan = rc.futan;
  if( init.isKourei2WariHairyoSochi && init.isGendogakuApplied ){
    return futan;
  } else {
    return roundKingaku(futan);
  }
}

function roundKingaku(kingaku: number): number {
  return Math.round(kingaku / 10.0) * 10;
}

