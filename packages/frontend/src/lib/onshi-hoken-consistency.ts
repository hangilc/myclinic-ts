import { Koukikourei, Shahokokuho, } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { ResultItem } from "onshi-result/ResultItem";
import { isKoukikourei } from "./hoken-rep";
import { toHankaku } from "./zenkaku";

export namespace OnshiHokenInconsistency {
  export class Inconsistency {
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
      hokenValue: number,
      onshiValue: number,
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
      super("本人・家族", cvt(hokenHonninKazoku), cvt(onshiHonninKazoku));
    }
  }

}

export type OnshiHokenConsistencyError =
  OnshiHokenInconsistency.InconsistentHokenshaBangou
  | OnshiHokenInconsistency.InconsistentHihokenshaKigou
  | OnshiHokenInconsistency.InconsistentHihokenshaBangou
  | OnshiHokenInconsistency.InconsistentEdaban
  | OnshiHokenInconsistency.InconsistentKoureiJukyuu
  | OnshiHokenInconsistency.InconsistentHonninKazoku
  ;

export function checkOnshiShahokokuhoConsistency: OnshiHokenConsistencyError[] (
  r: ResultItem,
  shahokokuho: Shahokokuho,
) {
  const errors: OnshiHokenConsistencyError[] = [];
  const hokenshaBangou = parseInt(r.insurerNumber || "0");
  if (shahokokuho.hokenshaBangou !== hokenshaBangou) {
    errors.push(new OnshiHokenInconsistency.InconsistentHokenshaBangou(
      shahokokuho.hokenshaBangou, hokenshaBangou
    ));
  }
  const hihokenshaKigou = r.insuredCardSymbol ?? "";
  if (toHankaku(shahokokuho.hihokenshaKigou) !== toHankaku(hihokenshaKigou)) {
    errors.push(new OnshiHokenInconsistency.InconsistentHihokenshaKigou(
      shahokokuho.hihokenshaKigou, hihokenshaKigou
    ));
  }
  const hihokenshaBangou = r.insuredIdentificationNumber || "";
  if (toHankaku(stripLeadingZero(shahokokuho.hihokenshaBangou)) !== toHankaku(stripLeadingZero(hihokenshaBangou))) {
    errors.push(new OnshiHokenInconsistency.InconsistentHihokenshaBangou(
      shahokokuho.hihokenshaBangou, hihokenshaBangou
    ));
  }
  const edaban = r.insuredBranchNumber || "";
  if (shahokokuho.edaban !== "" && toHankaku(stripLeadingZero(shahokokuho.edaban)) !== toHankaku(stripLeadingZero(edaban))) {
    errors.push(new OnshiHokenInconsistency.InconsistentEdaban(
      shahokokuho.edaban, edaban
    ));
  }
  const kourei: number = r.kourei != undefined ? r.kourei.futanWari ?? 0 : 0;
  if (shahokokuho.koureiStore !== kourei) {
    errors.push(new OnshiHokenInconsistency.InconsistentKoureiJukyuu(
      shahokokuho.koureiStore, kourei
    ));
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
      errors.push(new OnshiHokenInconsistency.InconsistentHonninKazoku(
        shahokokuho.honninStore, 0
      ));
    }
  }
  return errors;
}

export function shahokokuhoOnshiConsistent(
  shahokokuho: Shahokokuho,
  r: ResultItem
): string | undefined {
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
  if (r.personalFamilyClassification != undefined) {
    const honnin = r.personalFamilyClassification;
    if (honnin === "本人") {
      if (shahokokuho.honninStore === 0) {
        return `本人・家族が一致しません。${shahokokuho.honninStore} - ${honnin}`;
      }
    } else {
      if (shahokokuho.honninStore !== 0) {
        return `本人・家族が一致しません。${shahokokuho.honninStore} - ${honnin}`;
      }
    }
  }
  return undefined;
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
  return undefined;
}

function stripLeadingZero(s: string): string {
  return s.replace(/^[0０]+/, "");
}

export function create_hoken_from_onshi_kakunin(patientId: number, r: ResultItem):
  Shahokokuho | Koukikourei | string {
  const validFromOpt: string | undefined = r.insuredCardValidDate;
  if (validFromOpt === undefined) {
    return "保険証の有効期限開始日がありません。";
  }
  const validFrom = validFromOpt;
  const validUpto: string = r.insuredCardExpirationDate ?? "0000-00-00";
  const hokenshaBangou: string = r.insurerNumber ?? "";
  if (hokenshaBangou === "") {
    return "保険者番号が取得できません。";
  }
  const hokenshaNumber: number = parseInt(hokenshaBangou);
  if (isNaN(hokenshaNumber)) {
    return "保険者番号が数値でありません。" + hokenshaBangou;
  }
  const hihokenshaBangou: string = r.insuredIdentificationNumber ?? "";
  if (hihokenshaBangou === "") {
    return "被保険者番号が取得できません。";
  }
  if (isKoukikourei(hokenshaNumber)) {
    console.log(r);
    const futanWari: number | undefined = r.koukikoureiFutanWari;
    if (futanWari === undefined) {
      return "後期高齢保険の負担割合が取得できません。"
    }
    return new Koukikourei(0, patientId, hokenshaBangou, hihokenshaBangou, futanWari, validFrom, validUpto);
  } else {
    const kigou = r.insuredCardSymbol ?? "";
    const honninStore: number | undefined = r.honninStore;
    if (honninStore === undefined) {
      return "本人・家族の情報が得られませんでした。";
    }
    const kourei = r.elderlyRecipientCertificateInfo;
    let koureiStore: number;
    if (kourei === undefined) {
      koureiStore = 0;
    } else {
      if (kourei.futanWari === undefined) {
        return "高齢受給者証の負担割合が取得できません。";
      }
      koureiStore = kourei.futanWari;
    }
    const edaban: string = r.insuredBranchNumber ?? "";
    return new Shahokokuho(0, patientId, hokenshaNumber, kigou, hihokenshaBangou, honninStore,
      validFrom, validUpto, koureiStore, edaban)
  }
}