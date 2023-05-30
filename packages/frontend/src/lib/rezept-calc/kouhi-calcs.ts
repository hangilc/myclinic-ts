import type { KouhiCalc, RezeptCharge } from "./rezept-charge";


export const CoverAllFutan: KouhiCalc = (rezeptCharge: RezeptCharge) => {
  return rezeptCharge.modifyFutan(0);
}

export function futanLimiter(limitKingaku: number): KouhiCalc {
  return (rc: RezeptCharge) => {
    if( rc.futan > limitKingaku ){
      return rc.modifyFutan(limitKingaku);
    } else {
      return rc;
    }
  }
}
