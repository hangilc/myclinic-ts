import type { Kouhi } from "myclinic-model";
import { CoverAllFutan } from "./kouhi-calcs";
import type { KouhiCalc } from "./rezept-charge";

export function resolveKouhiCalc(kouhi: Kouhi): KouhiCalc | undefined {
  switch(kouhi.futansha){
    case 82134008: // 被爆者の子・小児精神病
      return CoverAllFutan;
    default: return undefined;
  }
}