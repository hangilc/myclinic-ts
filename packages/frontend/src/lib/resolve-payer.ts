import { mkKouhiNanbyou, mkUnknownPayer, type Payer } from "myclinic-rezept/futan/calc";
import type { Kouhi } from "myclinic-model";

export interface KouhiContext {
  nannbyouGendogaku?: number;
}

export function resolveKouhiPayer(kouhi: Kouhi, ctx: KouhiContext): Payer {
  switch (kouhi.futansha) {
    default: break;
  }
  const houbetsu = Math.floor(kouhi.futansha / 1000000);
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