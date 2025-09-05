import { Koukikourei, Shahokokuho, } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";
import { toHankaku } from "./zenkaku";

export namespace OnshiHokenInconsistency {
  export class Inconsistency {
    isHokenInconsistency: boolean = true;
    messageLead: string;
    hokenValue: string;
    onshiValue: string;

    constructor(messageLead: string, hokenValue: string, onshiValue: string) {
      this.messageLead = messageLead.replace(/。$/, "");
      this.hokenValue = hokenValue;
      this.onshiValue = onshiValue;
    }

    toString(): string {
      return `${this.messageLead}。保険：${this.hokenValue}、資格確認：${this.onshiValue}`;
    }
  }
  export class InconsistentHokenshaBangou extends Inconsistency {
    readonly isInconsistentHokenshaBangou = true;

    constructor(
      hokenValue: string,
      onshiValue: string,
    ) {
      super("保険者番号が一致しません", hokenValue.toString(), onshiValue.toString());
    }
  }

  export class InconsistentHihokenshaKigou extends Inconsistency {
    readonly isInconsistentHihokenshaKigou = true;

    constructor(hokenKigou: string, onshiKigou: string) {
      super("被保険者記号が一致しません", hokenKigou, onshiKigou);
    }
  }

  export class InconsistentHihokenshaBangou extends Inconsistency {
    readonly isInconsistentHihokenshaBangou = true;

    constructor(hokenBangou: string, onshiBangou: string) {
      super("被保険者番号が一致しません", hokenBangou, onshiBangou);
    }
  }

  export class InconsistentEdaban extends Inconsistency {
    readonly isInconsistentEdaban = true;

    constructor(hokenEdaban: string, onshiEdaban: string) {
      super("枝番が一致しません", hokenEdaban, onshiEdaban);
    }
  }

  export class InconsistentKoureiJukyuu extends Inconsistency {
    readonly InconsistentKoureiJukyuu = true;

    constructor(hokenKoureiFutanWari: number, onshiKoureiFutanWari: number) {
      function cvt(futanWari: number): string {
        if (futanWari === 0) {
          return "高齢受給なし";
        } else {
          return `高齢${futanWari}割`;
        }
      }
      super("高齢受給が一致しません", cvt(hokenKoureiFutanWari), cvt(onshiKoureiFutanWari));
    }
  }

  export class InconsistentHonninKazoku extends Inconsistency {
    readonly InconsistentHonninKazoku = true;

    constructor(hokenHonninKazoku: number, onshiHonninKazoku: number) {
      function cvt(honninKazoku: number): string {
        if (honninKazoku === 0) {
          return "家族";
        } else {
          return "本人";
        }
      }
      super("本人・家族が一致しません", cvt(hokenHonninKazoku), cvt(onshiHonninKazoku));
    }
  }

  export class InconsistentKoureiFutanWari extends Inconsistency {
    readonly isInconsistentKoureiFutanWari = true;

    constructor(hokenFutanWari: number, onshiFutanWari: number) {
      super("後期高齢負担割が一致しません", `${hokenFutanWari}割`, `${onshiFutanWari}割`)
    }
  }

}

export class OnshiError {
  msg: string;

  constructor(msg: string) {
    this.msg = msg;
  }

  toString(): string {
    return this.msg;
  }
}

export type OnshiHokenConsistencyError =
  OnshiHokenInconsistency.InconsistentHokenshaBangou
  | OnshiHokenInconsistency.InconsistentHihokenshaKigou
  | OnshiHokenInconsistency.InconsistentHihokenshaBangou
  | OnshiHokenInconsistency.InconsistentEdaban
  | OnshiHokenInconsistency.InconsistentKoureiJukyuu
  | OnshiHokenInconsistency.InconsistentHonninKazoku
  | OnshiHokenInconsistency.InconsistentKoureiFutanWari
  | OnshiError
  ;

export function checkOnshiShahokokuhoConsistency(
  r: ResultItem,
  shahokokuho: Shahokokuho,
): OnshiHokenConsistencyError[] {
  const errors: OnshiHokenConsistencyError[] = [];
  const hokenshaBangou = parseInt(r.insurerNumber || "0");
  {

    if (shahokokuho.hokenshaBangou !== hokenshaBangou) {
      errors.push(new OnshiHokenInconsistency.InconsistentHokenshaBangou(
        shahokokuho.hokenshaBangou.toString(), hokenshaBangou.toString()
      ));
    }
  }
  {
    const hihokenshaKigou = r.insuredCardSymbol ?? "";
    if (toHankaku(shahokokuho.hihokenshaKigou) !== toHankaku(hihokenshaKigou)) {
      errors.push(new OnshiHokenInconsistency.InconsistentHihokenshaKigou(
        shahokokuho.hihokenshaKigou, hihokenshaKigou
      ));
    }
  }
  {
    const hihokenshaBangou = r.insuredIdentificationNumber || "";
    if (toHankaku(stripLeadingZero(shahokokuho.hihokenshaBangou)) !== toHankaku(stripLeadingZero(hihokenshaBangou))) {
      errors.push(new OnshiHokenInconsistency.InconsistentHihokenshaBangou(
        shahokokuho.hihokenshaBangou, hihokenshaBangou
      ));
    }
  }
  {
    const edaban = r.insuredBranchNumber || "";
    if (shahokokuho.edaban !== edaban) {
      errors.push(new OnshiHokenInconsistency.InconsistentEdaban(
        shahokokuho.edaban, edaban
      ));
    }
  }
  {
    const kourei: number = r.kourei != undefined ? r.kourei.futanWari ?? 0 : 0;
    if (shahokokuho.koureiStore !== kourei) {
      errors.push(new OnshiHokenInconsistency.InconsistentKoureiJukyuu(
        shahokokuho.koureiStore, kourei
      ));
    }
  }
  if (r.personalFamilyClassification != undefined) {
    const honnin = r.personalFamilyClassification;
    if (honnin === "本人") {
      if (shahokokuho.honninStore === 0) {
        errors.push(new OnshiHokenInconsistency.InconsistentHonninKazoku(
          shahokokuho.honninStore, 1
        ));
      }
    } else {
      if (shahokokuho.honninStore !== 0) {
        errors.push(new OnshiHokenInconsistency.InconsistentHonninKazoku(
          shahokokuho.honninStore, 0
        ));
      }
    }
  }
  return errors;
}

export function checkOnshiKoukikoureiConsistency(
  r: ResultItem,
  koukikourei: Koukikourei,
): OnshiHokenConsistencyError[] {
  const errors: OnshiHokenConsistencyError[] = [];
  {
    const hokenshaBangou = r.insurerNumber ?? "";
    if (stripLeadingZero(koukikourei.hokenshaBangou) !== stripLeadingZero(hokenshaBangou)) {
      errors.push(new OnshiHokenInconsistency.InconsistentHokenshaBangou(
        koukikourei.hokenshaBangou, hokenshaBangou
      ))
    }
  }
  {
    const hihokenshaBangou = r.insuredIdentificationNumber ?? "";
    if (stripLeadingZero(koukikourei.hihokenshaBangou) !== stripLeadingZero(hihokenshaBangou)) {
      errors.push(new OnshiHokenInconsistency.InconsistentHihokenshaBangou(
        koukikourei.hihokenshaBangou, hihokenshaBangou
      ))
    }
  }
  {
    const futanWari = r.koukikoureiFutanWari ?? 0;
    if (futanWari > 0 && koukikourei.futanWari !== futanWari) {
      errors.push(new OnshiHokenInconsistency.InconsistentKoureiFutanWari(
        koukikourei.futanWari, futanWari
      ))
    }
  }
  return errors;
}

function stripLeadingZero(s: string): string {
  return s.replace(/^[0０]+/, "");
}

