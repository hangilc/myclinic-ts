import { kouhiRep, koukikoureiRep, shahokokuhoRep } from "@/lib/hoken-rep";
import { Shahokokuho, type Kouhi, Koukikourei } from "myclinic-model";
import type { OnshiResult } from "onshi-result";

export class HokenItem {
  hoken: Shahokokuho | Koukikourei;
  checked: boolean = false;
  confirm: OnshiResult | undefined = undefined;
  savedConfirm: OnshiResult | undefined = undefined;
  showDetail: boolean = false;

  constructor(hoken: Shahokokuho | Koukikourei){
    this.hoken = hoken;
  }

  get id(): string {
    if( this.hoken instanceof Shahokokuho ){
      return `shahokokuho:${this.hoken.shahokokuhoId}`;
    } else {
      return `koukikourei:${this.hoken.koukikoureiId}`;
    }
  }

  rep(): string {
    if( this.hoken instanceof Shahokokuho ){
      return shahokokuhoRep(this.hoken)
    } else {
      return koukikoureiRep(this.hoken.futanWari);
    }
  }

  hokenType(): string {
    if( this.hoken instanceof Shahokokuho ){
      return "shahokokuho";
    } else if( this.hoken instanceof Koukikourei ){
      return "koukikourei";
    } else {
      return "unknown";
    }
  }
}

export class KouhiItem {
  kouhi: Kouhi;
  checked: boolean;
  showDetail: boolean = false;

  constructor(kouhi: Kouhi, checked: boolean = false) {
    this.kouhi = kouhi;
    this.checked = checked;
  }

  rep(): string {
    return kouhiRep(this.kouhi.futansha, this.kouhi.memoAsJson);
  }
}
