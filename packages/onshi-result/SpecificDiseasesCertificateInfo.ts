import { isSpecificDiseasesDiseaseCategoryCode, SpecificDiseasesDiseaseCategory, SpecificDiseasesDiseaseCategoryLabel } from "./codes";
import { castOptStringProp } from "./cast";
import { toOptInt, onshiDateOptToSqlDateOpt } from "./util";

interface SpecificDiseasesCertificateInfoInterface {
  SpecificDiseasesDiseaseCategory: string | undefined;
  SpecificDiseasesCertificateDate: string | undefined;
  SpecificDiseasesValidStartDate: string | undefined;
  SpecificDiseasesValidEndDate: string | undefined;
  SpecificDiseasesSelfPay: string | undefined;
}

export class SpecificDiseasesCertificateInfo {
  orig: SpecificDiseasesCertificateInfoInterface;

  constructor(arg: SpecificDiseasesCertificateInfoInterface) {
    this.orig = arg;
  }

  // 証が発行される際に認定された疾病に係る分類
  get specificDiseasesDiseaseCategory(): SpecificDiseasesDiseaseCategoryLabel | undefined {
    const k: string | undefined = this.orig.SpecificDiseasesDiseaseCategory;
    if( k == undefined ){
      return undefined;
    } else if( isSpecificDiseasesDiseaseCategoryCode(k) ){
      return SpecificDiseasesDiseaseCategory[k];
    } else {
      throw new Error("Invalid SpecificDiseasesDiseaseCategory: " + k);
    }
  }

  // 特定疾病療養受療証が交付された日 (YYYY-MM-DD)
  get specificDiseasesCertificateDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.SpecificDiseasesCertificateDate);
  }

  // 特定疾病療養受療証が有効である最初の日
  get specificDiseasesValidStartDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.SpecificDiseasesValidStartDate);
  }

  // 自己負担限度額変更、治癒により証を回収した場合に回収の理由が発生し
  // た日付
  get specificDiseasesValidEndDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.SpecificDiseasesValidEndDate);
  }

  // 1ヶ月あたりの自己負担限度額
  get specificDiseasesSelfPay(): number | undefined {
    return toOptInt(this.orig.SpecificDiseasesSelfPay);
  }

  toJsonObject(): object {
    return this.orig;
  }

  static cast(arg: any): SpecificDiseasesCertificateInfo {
    return new SpecificDiseasesCertificateInfo({
      SpecificDiseasesDiseaseCategory: castOptStringProp(arg, "SpecificDiseasesDiseaseCategory"),
      SpecificDiseasesCertificateDate: castOptStringProp(arg, "SpecificDiseasesCertificateDate"),
      SpecificDiseasesValidStartDate: castOptStringProp(arg, "SpecificDiseasesValidStartDate"),
      SpecificDiseasesValidEndDate: castOptStringProp(arg, "SpecificDiseasesValidEndDate"),
      SpecificDiseasesSelfPay: castOptStringProp(arg, "SpecificDiseasesSelfPay"),
    })
  }
}