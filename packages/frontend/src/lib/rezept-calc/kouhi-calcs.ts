import type { Kouhi } from "myclinic-model";
import type { KouhiCover } from "./rezept-charge";

export function applyKouhi(charge: number, kouhi: Kouhi): KouhiCover {
  const futansha = kouhi.futansha;
  switch(futansha){
    case 82134008: { // 被爆者の子に対する医療
      return {
        charge: 0,
        futanWari: 0,
      }
    }
    case 82137670: 
    case 82137530: { // 大気汚染関連疾病（負担あり）
      return {
        charge: charge,
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
