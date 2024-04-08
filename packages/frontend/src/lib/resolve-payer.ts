import { mkHokenPayer, mkNanbyouPayer, mkUnknownPayer, type Payer } from "myclinic-rezept/futan/calc";
import { resolveFutanWari } from "./futan-wari";
import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";

export function resolveHokenPayer(hoken: Shahokokuho | Koukikourei, gendogaku?: number ): Payer {
  const futanWari = resolveFutanWari(hoken);
  return mkHokenPayer(futanWari, gendogaku);
}

export interface KouhiContext {
  nannbyouGendogaku?: number;
}

export function resolveKouhiPayer(kouhi: Kouhi, ctx: KouhiContext): Payer {
  switch(kouhi.futansha){
    case 54136015: {
      const gendogaku = ctx.nannbyouGendogaku ?? kouhi.memoAsJson.gendogaku ?? 100000;
      return mkNanbyouPayer(gendogaku);
    }
    default: break;
  }
  return mkUnknownPayer();
}