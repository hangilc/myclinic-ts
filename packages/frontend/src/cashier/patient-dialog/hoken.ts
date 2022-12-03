import { kouhiRep, koukikoureiRep, roujinRep, shahokokuhoRep } from "@/lib/hoken-rep";
import { Koukikourei, Shahokokuho, Kouhi, Roujin } from "myclinic-model";

export type HokenType = Shahokokuho | Koukikourei | Roujin | Kouhi;

export class Hoken {
  value: HokenType

  constructor(value: HokenType) {
    this.value = value;
  }

  get key(): string {
    const h = this.value
    if( h instanceof Shahokokuho ){
      return `shahokokuho-${h.shahokokuhoId}`;
    } else if( h instanceof Koukikourei ){
      return `koukikourei-${h.koukikoureiId}`;
    } else if( h instanceof Roujin ){
      return `roujin-${h.roujinId}`;
    } else if( h instanceof Kouhi ){
      return `kouhi-${h.kouhiId}`;
    } else {
      throw new Error("不明の保険：" + h);
    }
  }

  get rep(): string {
    const h = this.value
    if( h instanceof Shahokokuho ){
      return shahokokuhoRep(h);
    } else if( h instanceof Koukikourei ){
      return koukikoureiRep(h.futanWari);
    } else if( h instanceof Roujin ){
      return roujinRep(h.futanWari)
    } else if( h instanceof Kouhi ){
      return kouhiRep(h.futansha);
    } else {
      throw new Error("不明の保険：" + h);
    }
  }
}