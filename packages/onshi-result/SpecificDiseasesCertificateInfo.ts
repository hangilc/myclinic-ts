import {
  isSpecificDiseasesDiseaseCategoryCode,
  SpecificDiseasesDiseaseCategory,
  type SpecificDiseasesDiseaseCategoryLabel
} from "./codes";
import { castOptStringProp } from "./cast";
import { toOptInt, onshiDateOptToSqlDateOpt } from "./util";
import { quiet } from "./config";

export interface SpecificDiseasesCertificateInfoInterface {
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
    if (k == undefined) {
      return undefined;
    } else if (isSpecificDiseasesDiseaseCategoryCode(k)) {
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

  toJSON(): object {
    return this.orig;
  }

  static isSpecificDiseasesCertificateInfoInterface(arg: any): arg is SpecificDiseasesCertificateInfoInterface {
    if (typeof arg === "object") {
      return castOptStringProp(arg, "SpecificDiseasesDiseaseCategory") &&
        castOptStringProp(arg, "SpecificDiseasesCertificateDate") &&
        castOptStringProp(arg, "SpecificDiseasesValidStartDate") &&
        castOptStringProp(arg, "SpecificDiseasesValidEndDate") &&
        castOptStringProp(arg, "SpecificDiseasesSelfPay");
    } else {
      if( !quiet ){
        console.error("is not object (isSpecificDiseasesCertificateInfoInterface)");
      }
      return false;
    }
  }

  static cast(arg: any): SpecificDiseasesCertificateInfo {
    if (SpecificDiseasesCertificateInfo.isSpecificDiseasesCertificateInfoInterface(arg)) {
      return new SpecificDiseasesCertificateInfo(arg);
    } else {
      throw new Error("isSpecificDiseasesCertificate");
    }
  }
}