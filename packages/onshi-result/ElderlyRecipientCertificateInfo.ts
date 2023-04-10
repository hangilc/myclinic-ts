import { toOptInt, onshiDateOptToSqlDateOpt } from "./util";
import { castOptStringProp } from "./cast";

export interface ElderlyRecipientCertificateInfoInterface {
  ElderlyRecipientCertificateDate: string | undefined;
  ElderlyRecipientValidStartDate: string | undefined;
  ElderlyRecipientValidEndDate: string | undefined;
  ElderlyRecipientContributionRatio: string | undefined;
}

export class ElderlyRecipientCertificateInfo {
  orig: ElderlyRecipientCertificateInfoInterface;

  constructor(arg: ElderlyRecipientCertificateInfoInterface) {
    this.orig = arg;
  }

  // 高齢受給者証が交付された日 (YYYY-MM-DD)
  get elderlyRecipientCertificateDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.ElderlyRecipientCertificateDate);
  }

  // 高齢受給者証が有効である最初の日
  get elderlyRecipientValidStartDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.ElderlyRecipientValidStartDate);
  }

  // 高齢受給者証が有効である最後の日
  get elderlyRecipientValidEndDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.ElderlyRecipientValidEndDate);
  }

  // 高齢受給者証に記載されている一部負担金の割合（％）
  get elderlyRecipientContributionRatio(): number | undefined {
    return toOptInt(this.orig.ElderlyRecipientContributionRatio);
  }

  // 負担割（例： 3)
  get futanWari(): number | undefined {
    const r = this.elderlyRecipientContributionRatio;
    if( r == undefined ){
      return undefined;
    } else {
      return r / 10;
    }
  }

  toJSON(): object {
    return this.orig;
  }

  static isElderlyRecipientCertificateInfoInterface(arg: any): arg is ElderlyRecipientCertificateInfoInterface {
    if( typeof arg === "object" ){
      return castOptStringProp(arg, "ElderlyRecipientCertificateDate") &&
        castOptStringProp(arg, "ElderlyRecipientValidStartDate") &&
        castOptStringProp(arg, "ElderlyRecipientValidEndDate") &&
        castOptStringProp(arg, "ElderlyRecipientContributionRatio");
    } else {
      return false;
    }
  }

  static cast(arg: any): ElderlyRecipientCertificateInfo {
    if( this.isElderlyRecipientCertificateInfoInterface(arg) ){
      return new ElderlyRecipientCertificateInfo(arg);
    } else {
      throw new Error("Cannot create ElderlyRecipientCertificateInfo");
    }
  }
}