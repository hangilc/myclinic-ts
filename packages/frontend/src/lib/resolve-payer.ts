import { mkKouhiNanbyou, mkMaruAo, mkMaruShoFutanAri, mkMaruShoFutanNashi, mkMaruToHibakushaNoKo, mkMaruToTaikiosen, mkUnknownPayer, type Payer } from "myclinic-rezept/futan/calc";
import type { Kouhi } from "myclinic-model";

export interface KouhiContext {
  nannbyouGendogaku?: number;
}

export function resolveKouhiPayer(kouhi: Kouhi, ctx: KouhiContext): Payer {
  const p5 = part(kouhi.futansha, 5);
  switch (part(kouhi.futansha, 5)) {
    case 89135:
    case 89137: {
      return mkMaruAo();
    }
    case 80136: return mkMaruShoFutanAri(18000);
    case 80137: return mkMaruShoFutanNashi();
  }
  switch (kouhi.futansha) {
    case 82134008: return mkMaruToHibakushaNoKo();
    case 82137670: case 82137530: return mkMaruToTaikiosen(6000);
    case 82137001: case 82137555: return mkMaruToTaikiosen(0);
    default: break;
  }
  // const houbetsu = Math.floor(kouhi.futansha / 1000000);
  const houbetsu = part(kouhi.futansha, 2);
  switch (houbetsu) {
    case 54: { // 難病
      const gendogaku = ctx.nannbyouGendogaku ?? kouhi.memoAsJson.gendogaku ?? 100000;
      return mkKouhiNanbyou(gendogaku);
    }
    default: break;
  }
  console.error("Unknown kouhi futansha", kouhi);
  return mkUnknownPayer();
}

function part(futansha: number, len: number): number {
  let d = 1;
  for (let i = 0; i < (8 - len); i++) {
    d *= 10;
  }
  return Math.floor(futansha / d);
}