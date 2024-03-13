import { Koukikourei, Shahokokuho, } from "myclinic-model";
import type { ResultItem } from "onshi-result/ResultItem";
import { isKoukikourei } from "./hoken-rep";
import { toHankaku } from "./zenkaku";
import { onshiDateToSqlDate } from "onshi-result/util";
import type { ShahokokuhoInterface } from "myclinic-model/model";

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
    if (shahokokuho.edaban !== "" && toHankaku(stripLeadingZero(shahokokuho.edaban)) !== toHankaku(stripLeadingZero(edaban))) {
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
  // if (r.personalFamilyClassification != undefined) {
  //   const honnin = r.personalFamilyClassification;
  //   if (honnin === "本人") {
  //     if (shahokokuho.honninStore === 0) {
  //       errors.push(new OnshiHokenInconsistency.InconsistentHonninKazoku(
  //         shahokokuho.honninStore, 1
  //       ));
  //     }
  //   } else {
  //     if (shahokokuho.honninStore !== 0) {
  //       errors.push(new OnshiHokenInconsistency.InconsistentHonninKazoku(
  //         shahokokuho.honninStore, 0
  //       ));
  //     }
  //   }
  // }
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

export type ShahokokuhoOnshiInconsistency =
  "inconsistent-hokensha-bangou" |
  "inconsistent-hihokensha-kigou" |
  "inconsistent-hihokensha-bangou" |
  "inconsistent-edaban" |
  "inconsistent-honnin-kazoku" |
  "inconsistent-kourei" |
  "inconsistent-valid-from" |
  "inconsistent-valid-upto";

export function checkShahokokuhoOnshiConsistency(shahokokuho: Shahokokuho, resultItem: ResultItem): ShahokokuhoOnshiInconsistency[] {
  const diff: ShahokokuhoOnshiInconsistency[] = [];
  const hokenshaBangou = parseInt(resultItem.insurerNumber || "0");
  if (shahokokuho.hokenshaBangou !== hokenshaBangou) {
    diff.push("inconsistent-hokensha-bangou");
  }
  const hihokenshaKigou = resultItem.insuredCardSymbol ?? "";
  if (toHankaku(shahokokuho.hihokenshaKigou) !== toHankaku(hihokenshaKigou)) {
    diff.push("inconsistent-hihokensha-kigou");
  }
  const hihokenshaBangou = resultItem.insuredIdentificationNumber || "";
  if (toHankaku(stripLeadingZero(shahokokuho.hihokenshaBangou)) !== toHankaku(stripLeadingZero(hihokenshaBangou))) {
    diff.push("inconsistent-hihokensha-bangou");
  }
  const edaban = resultItem.insuredBranchNumber || "";
  if (shahokokuho.edaban !== "" && toHankaku(stripLeadingZero(shahokokuho.edaban)) !== toHankaku(stripLeadingZero(edaban))) {
    diff.push("inconsistent-edaban");
  }
  const kourei: number = resultItem.kourei != undefined ? resultItem.kourei.futanWari ?? 0 : 0;
  if (shahokokuho.koureiStore !== kourei) {
    diff.push("inconsistent-kourei");
  }
  const validFrom: string | undefined = resultItem.insuredCardValidDate;
  if (shahokokuho.validFrom !== validFrom) {
    diff.push("inconsistent-valid-from");
  }
  const validUpto: string = resultItem.insuredCardExpirationDate ? resultItem.insuredCardExpirationDate : "0000-00-00";
  if (shahokokuho.validUpto !== validUpto) {
    diff.push("inconsistent-valid-upto");
  }
  if (resultItem.personalFamilyClassification != undefined) {
    const honnin = resultItem.personalFamilyClassification;
    if (honnin === "本人") {
      if (shahokokuho.honninStore === 0) {
        diff.push("inconsistent-honnin-kazoku");
      }
    } else {
      if (shahokokuho.honninStore !== 0) {
        diff.push("inconsistent-honnin-kazoku");
      }
    }
  }
  return diff;
}

export function canFixShahokokuhoSafely(orig: Shahokokuho, curr: Shahokokuho, inconsistencies: ShahokokuhoOnshiInconsistency[])
  : Shahokokuho | undefined {
  const m: ShahokokuhoInterface = orig.asJson();
  for(let i of inconsistencies){
    switch(i){
      case  "inconsistent-edaban": {
        if( m.edaban === undefined || m.edaban === "" ) {
          m.edaban = curr.edaban;
          break;
        } else {
          // fall through
        }
      }
      case  "inconsistent-honnin-kazoku": {
        m.honninStore = curr.honninStore;
        break;
      }
      case  "inconsistent-valid-upto": {

      }
      default: return undefined;
    }
  }
  return Shahokokuho.fromJson(m);
}

export function shahokokuhoOnshiConsistent(
  shahokokuho: Shahokokuho,
  r: ResultItem
): string | undefined {
  console.log("enter shahokokuhoOnshiConsistent", shahokokuho, r);
  const hokenshaBangou = parseInt(r.insurerNumber || "0");
  if (shahokokuho.hokenshaBangou !== hokenshaBangou) {
    return `保険者番号が一致しません。${shahokokuho.hokenshaBangou} - ${hokenshaBangou}`;
  }
  const hihokenshaKigou = r.insuredCardSymbol ?? "";
  if (toHankaku(shahokokuho.hihokenshaKigou) !== toHankaku(hihokenshaKigou)) {
    return `被保険者記号が一致しません。${shahokokuho.hihokenshaKigou} - ${hihokenshaKigou}`;
  }
  const hihokenshaBangou = r.insuredIdentificationNumber || "";
  if (toHankaku(stripLeadingZero(shahokokuho.hihokenshaBangou)) !== toHankaku(stripLeadingZero(hihokenshaBangou))) {
    return `被保険者番号が一致しません。${shahokokuho.hihokenshaBangou} - ${hihokenshaBangou}`;
  }
  const edaban = r.insuredBranchNumber || "";
  if (shahokokuho.edaban !== "" && toHankaku(stripLeadingZero(shahokokuho.edaban)) !== toHankaku(stripLeadingZero(edaban))) {
    return `枝番が一致しません。${shahokokuho.edaban} - ${edaban}`;
  }
  const kourei: number = r.kourei != undefined ? r.kourei.futanWari ?? 0 : 0;
  if (shahokokuho.koureiStore !== kourei) {
    return `高齢が一致しません。${shahokokuho.koureiStore} - ${kourei}`;
  }
  const validFrom: string | undefined = r.insuredCardValidDate;
  if (shahokokuho.validFrom !== validFrom) {
    return "期限開始が一致しません。";
  }
  const validUpto: string = r.insuredCardExpirationDate ? r.insuredCardExpirationDate : "0000-00-00";
  if (shahokokuho.validUpto !== validUpto) {
    return "期限終了が一致しません。";
  }
  if (r.personalFamilyClassification != undefined) {
    const honnin = r.personalFamilyClassification;
    if (honnin === "本人") {
      if (shahokokuho.honninStore === 0) {
        return `本人・家族が一致しません。${honninRep(shahokokuho.honninStore)} - ${honnin}`;
      }
    } else {
      if (shahokokuho.honninStore !== 0) {
        return `本人・家族が一致しません。${honninRep(shahokokuho.honninStore)} - ${honnin}`;
      }
    }
  }
  return undefined;
}

function honninRep(honninStore: number): string {
  if (honninStore === 0) {
    return "家族";
  } else {
    return "本人";
  }
}

export function koukikoureiOnshiConsistent(
  koukikourei: Koukikourei,
  r: ResultItem
): string | undefined {
  const hokenshaBangou = r.insurerNumber ?? "";
  if (stripLeadingZero(koukikourei.hokenshaBangou) !== stripLeadingZero(hokenshaBangou)) {
    return `保険者番号が一致しません。${koukikourei.hokenshaBangou} - ${hokenshaBangou}`;
  }
  const hihokenshaBangou = r.insuredIdentificationNumber ?? "";
  if (stripLeadingZero(koukikourei.hihokenshaBangou) !== stripLeadingZero(hihokenshaBangou)) {
    return `被保険者番号が一致しません。${koukikourei.hihokenshaBangou} - ${hihokenshaBangou}`;
  }
  const futanWari = r.koukikoureiFutanWari ?? 0;
  if (futanWari > 0 && koukikourei.futanWari !== futanWari) {
    return `負担割が一致しません。${koukikourei.futanWari} - ${futanWari}`;
  }
  const validFrom: string | undefined = r.insuredCardValidDate;
  if (koukikourei.validFrom !== validFrom) {
    return "期限開始が一致しません。";
  }
  const validUpto: string = r.insuredCardExpirationDate ?? "0000-00-00";
  if (koukikourei.validUpto !== validUpto) {
    return "期限終了が一致しません。";
  }
  return undefined;
}

function stripLeadingZero(s: string): string {
  return s.replace(/^[0０]+/, "");
}

