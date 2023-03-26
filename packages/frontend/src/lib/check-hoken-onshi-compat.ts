import type { Koukikourei, Shahokokuho } from "myclinic-model";
import type { ResultOfQualificationConfirmation } from "onshi-result/ResultOfQualificationConfirmation";

export function checkShahokokuhoOnshiCompat(shahokokuho: Shahokokuho, r: ResultOfQualificationConfirmation): string | undefined {
  if (r.personalFamilyClassification) {
    if (r.personalFamilyClassification === "本人") {
      if (!(shahokokuho.honninStore !== 0)) {
        return "本人・家族のデータが一致しません。保険内容を確認してください。";
      }
    } else {
      if (!(shahokokuho.honninStore === 0)) {
        return "本人・家族のデータが一致しません。保険内容を確認してください。";
      }
    }
  }
  if (r.elderlyRecipientCertificateInfo) {
    const e = r.elderlyRecipientCertificateInfo;
    if (e.futanWari !== shahokokuho.koureiStore) {
      if (!(shahokokuho.koureiStore === 0)) {
        return "高齢受給者証のデータが一致しません。保険内容を確認してください。";
      }
    }
  } else {
    if (!(shahokokuho.koureiStore === 0)) {
      return "高齢受給者証のデータが一致しません。保険内容を確認してください。";
    }
  }
  return undefined;
}

export function checkKoukikoureiOnshiCompat(koukikourei: Koukikourei, r: ResultOfQualificationConfirmation): string | undefined {
  if( r.insuredPartialContributionRatio !== undefined ){
    if( koukikourei.futanWari !== r.insuredPartialContributionRatio ){
      return "後期高齢保険の負担割データが一致しません。保険内容を確認してください。";
    }
  }
  return undefined;
}