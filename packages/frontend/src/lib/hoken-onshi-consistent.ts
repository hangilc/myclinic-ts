import type { Koukikourei, Shahokokuho } from "myclinic-model";
import type { ResultOfQualificationConfirmation } from "onshi-result/ResultOfQualificationConfirmation";
import { toHankaku } from "./zenkaku";

export function shahokokuhoOnshiConsistent(
  shahokokuho: Shahokokuho,
  r: ResultOfQualificationConfirmation
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
  r: ResultOfQualificationConfirmation
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