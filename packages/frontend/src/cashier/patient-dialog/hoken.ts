import { kouhiRep, koukikoureiRep, roujinRep, shahokokuhoRep } from "@/lib/hoken-rep";
import { Koukikourei, Shahokokuho, Kouhi, Roujin } from "myclinic-model";

export type HokenType = Shahokokuho | Koukikourei | Roujin | Kouhi;

export class Hoken {
  value: HokenType

  constructor(value: HokenType) {
    this.value = value;
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
      return "不明の保険"
    }
  }
}