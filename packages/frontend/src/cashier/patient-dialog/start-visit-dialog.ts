import type { Koukikourei, Shahokokuho } from "myclinic-model";
import type { OnshiResult } from "onshi-result";

export class ShahokokuhoItem {
  readonly isShahokokuhoItem = true;
  shahokokuho: Shahokokuho;
  checked: boolean;
  confirmed: OnshiResult | undefined = undefined;

  constructor(shahokokuho: Shahokokuho, checked: boolean = false) {
    this.shahokokuho = shahokokuho;
    this.checked = checked;
  }

  get value(): Shahokokuho {
    return this.shahokokuho;
  }
}

export class KoukikoureiItem {
  readonly isKoukikoureiItem = true;
  koukikourei: Koukikourei;
  checked: boolean;
  confirmed: OnshiResult | undefined = undefined;

  constructor(koukikourei: Koukikourei, checked: boolean = false) {
    this.koukikourei = koukikourei;
    this.checked = checked;
  }

  get value(): Koukikourei {
    return this.koukikourei;
  }
}
