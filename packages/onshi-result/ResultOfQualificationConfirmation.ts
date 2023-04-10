import { ElderlyRecipientCertificateInfo, type ElderlyRecipientCertificateInfoInterface } from "./ElderlyRecipientCertificateInfo";
import { LimitApplicationCertificateRelatedInfo, type LimitApplicationCertificateRelatedInfoInterface } from "./LimitApplicationCertificateRelatedInfo";
import { castOptConvert, castOptStringProp, castOptTest, castStringProp } from "./cast";
import {
  InsuredCardClassification,
  type InsuredCardClassificationLabel,
  isInsuredCardClassificationCode,
  isLimitApplicationCertificateRelatedConsFlgCode,
  isPersonalFamilyClassificationCode,
  isPreschoolClassificationCode,
  isReasonOfLossCode,
  isSexCode,
  isSpecificDiseasesCertificateRelatedConsFlgCode,
  LimitApplicationCertificateRelatedConsFlg,
  type LimitApplicationCertificateRelatedConsFlgLabel,
  PersonalFamilyClassification,
  type PersonalFamilyClassificationLabel,
  PreschoolClassification,
  type PreschoolClassificationLabel,
  ReasonOfLoss,
  type ReasonOfLossLabel,
  Sex,
  type SexLabel,
  SpecificDiseasesCertificateRelatedConsFlg,
  type SpecificDiseasesCertificateRelatedConsFlgLabel
} from "./codes";
import { toOptInt, onshiDateOptToSqlDateOpt, onshiDateTimeOptToSqlDateTimeOpt, onshiDateToSqlDate } from "./util";
import { SpecificDiseasesCertificateInfo, type SpecificDiseasesCertificateInfoInterface } from "./SpecificDiseasesCertificateInfo";

export interface ResultOfQualificationConfirmationInterface {
  InsuredCardClassification: string;
  Name: string;
  Sex1: string;
  Birthdate: string;
  InsurerName: string;
  InsurerNumber: string | undefined;
  InsuredCardSymbol: string | undefined;
  InsuredIdentificationNumber: string | undefined;
  InsuredBranchNumber: string | undefined;
  PersonalFamilyClassification: string | undefined;
  InsuredName: string | undefined;
  NameOfOther: string | undefined;
  NameKana: string | undefined;
  NameOfOtherKana: string | undefined;
  Sex2: string | undefined;
  Address: string | undefined;
  PostNumber: string | undefined;
  InsuredCertificateIssuanceDate: string | undefined;
  InsuredCardValidDate: string | undefined;
  InsuredCardExpirationDate: string | undefined;
  InsuredPartialContributionRatio: string | undefined;
  PreschoolClassification: string | undefined;
  ReasonOfLoss: string | undefined;
  ElderlyRecipientCertificateInfo: ElderlyRecipientCertificateInfoInterface | undefined;
  LimitApplicationCertificateRelatedConsFlg: string | undefined;
  LimitApplicationCertificateRelatedConsTime: string | undefined;
  LimitApplicationCertificateRelatedInfo: LimitApplicationCertificateRelatedInfoInterface | undefined;
  SpecificDiseasesCertificateRelatedConsFlg: string | undefined;
  SpecificDiseasesCertificateRelatedConsTime: string | undefined;
  SpecificDiseasesCertificateList: SpecificDiseasesCertificateInfoInterface[] | undefined;
}

export class ResultOfQualificationConfirmation {
  orig: ResultOfQualificationConfirmationInterface;
  // 高齢受給者証情報
  elderlyRecipientCertificateInfo: ElderlyRecipientCertificateInfo | undefined;
  // 限度額適用認定証関連情報
  limitApplicationCertificateRelatedInfo: LimitApplicationCertificateRelatedInfo | undefined;
  // 特定疾病療養受療証情報リスト
  specificDiseasesCertificateList: SpecificDiseasesCertificateInfo[];

  constructor(arg: ResultOfQualificationConfirmationInterface) {
    this.orig = arg;
    this.elderlyRecipientCertificateInfo = castOptConvert(arg.ElderlyRecipientCertificateInfo,
      ElderlyRecipientCertificateInfo.cast);
    this.limitApplicationCertificateRelatedInfo = castOptConvert(arg.LimitApplicationCertificateRelatedInfo,
      LimitApplicationCertificateRelatedInfo.cast);
    this.specificDiseasesCertificateList =
      (arg.SpecificDiseasesCertificateList ?? []).map(SpecificDiseasesCertificateInfo.cast);
  }

  // 被保険者証の種類
  get insuredCardClassification(): InsuredCardClassificationLabel {
    const k: string = this.orig.InsuredCardClassification;
    if (isInsuredCardClassificationCode(k)) {
      return InsuredCardClassification[k];
    } else {
      throw new Error("Invalid InsuredCardClassification: " + k);
    }
  }

  // 保険者が登録した券面記載の保険者番号
  get insurerNumber(): string | undefined {
    return this.orig.InsurerNumber
  }

  // 保険者が登録した券面記載の被保険者証記号
  get insuredCardSymbol(): string | undefined {
    return this.orig.InsuredCardSymbol;
  }

  // 保険者が登録した券面記載の被保険者証番号
  get insuredIdentificationNumber(): string | undefined {
    return this.orig.InsuredIdentificationNumber;
  }

  // 保険者が登録した加入者の被保険者証記号・番号単位に設定される枝番（2桁の番号）
  get insuredBranchNumber(): string | undefined {
    return this.orig.InsuredBranchNumber;
  }

  // 本人・家族の別
  get personalFamilyClassification(): PersonalFamilyClassificationLabel | undefined {
    const k: string | undefined = this.orig.PersonalFamilyClassification;
    if (k == undefined) {
      return undefined;
    } else if (isPersonalFamilyClassificationCode(k)) {
      return PersonalFamilyClassification[k];
    } else {
      throw new Error("Invalid PersonalFamilyClassification: " + k);
    }
  }

  get honninStore(): number | undefined {
    const honnin = this.personalFamilyClassification;
    if (honnin === undefined) {
      return undefined;
    } else {
      if (honnin === "本人") {
        return 1;
      } else {
        return 0;
      }
    }
  }

  // 被保険者の氏名（世帯主氏名）
  get insuredName(): string | undefined {
    return this.orig.InsuredName;
  }

  // 対象者本人から保険者等へ届出された券面記載の氏名
  get name(): string {
    return this.orig.Name;
  }

  // 対象者本人から、通称等の理由で券面記載氏名とは別の氏名が届出されて
  // いる場合に設定される
  get nameOfOther(): string | undefined {
    return this.orig.NameOfOther;
  }

  // 対象者本人から保険者等へ届出された券面記載の氏名（半角カナ）
  get nameKana(): string | undefined {
    return this.orig.NameKana;
  }

  // 氏名（その他）の読み仮名（半角カナ）
  get nameOfOtherKana(): string | undefined {
    return this.orig.NameOfOtherKana;
  }

  // 券面表面の性別
  get sex1(): SexLabel {
    const k: string = this.orig.Sex1;
    if (isSexCode(k)) {
      return Sex[k];
    } else {
      throw new Error("Invalid Sex1: " + k);
    }
  }

  get sex(): SexLabel {
    return this.sex1;
  }

  // 性別
  // 「平成24年9月21日事務連絡　被保険者証の性別表記について」または「生
  // 活保護法による医療券等の記載要領について」（平成11年8月27日社援保第
  // 41号）に基づく取り扱いを実施している場合に設定する。
  get sex2(): SexLabel | undefined {
    const k: string | undefined = this.orig.Sex2;
    if (k == undefined) {
      return undefined;
    } else if (isSexCode(k)) {
      return Sex[k];
    } else {
      throw new Error("Invalid Sex2: " + k);
    }
  }

  // 券面の生年月日
  get birthdate(): string {
    return onshiDateToSqlDate(this.orig.Birthdate);
  }

  // 保険者等に届出されている住所
  get address(): string | undefined {
    return this.orig.Address;
  }

  // 対象者本人の郵便番号
  get postNumber(): string | undefined {
    return this.orig.PostNumber;
  }

  // 被保険者証が交付された日 (YYYY-MM-DD)
  get insuredCertificateIssuanceDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.InsuredCertificateIssuanceDate);
  }

  // 被保険者証が有効である最初の日 (YYYY-MM-DD)
  get insuredCardValidDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.InsuredCardValidDate);
  }

  // 被保険者証が有効である最後の日 (YYYY-MM-DD)
  get insuredCardExpirationDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.InsuredCardExpirationDate);
  }

  // 後期高齢者の一部負担割合（％）
  // （例）1割負担の時は、"010"と設定する。
  get insuredPartialContributionRatio(): number | undefined {
    return toOptInt(this.orig.InsuredPartialContributionRatio);
  }

  // 後期高齢者負担割（例：２）
  get koukikoureiFutanWari(): number | undefined {
    const r = this.insuredPartialContributionRatio;
    if (r == undefined) {
      return undefined;
    } else {
      return r / 10;
    }
  }

  // 未就学区分
  get preschoolClassification(): PreschoolClassificationLabel | undefined {
    const k: string | undefined = this.orig.PreschoolClassification;
    if (k == undefined) {
      return undefined;
    } else if (isPreschoolClassificationCode(k)) {
      return PreschoolClassification[k];
    } else {
      throw new Error("Invalid PreschoolClassification: " + k);
    }
  }

  // 資格喪失事由
  get reasonOfLoss(): ReasonOfLossLabel | undefined {
    const k: string | undefined = this.orig.ReasonOfLoss;
    if (k == undefined) {
      return undefined;
    } else if (isReasonOfLossCode(k)) {
      return ReasonOfLoss[k];
    } else {
      throw new Error("Invalid ReasonOfLoss: " + k);
    }
  }

  // 券面の保険者名称
  get insurerName(): string {
    return this.orig.InsurerName;
  }

  get kourei(): ElderlyRecipientCertificateInfo | undefined {
    return this.elderlyRecipientCertificateInfo;
  }

  // 限度額適用認定証の情報について、患者の提供同意を示す区分
  get limitApplicationCertificateRelatedConsFlg():
    LimitApplicationCertificateRelatedConsFlgLabel | undefined {
    const k: string | undefined = this.orig.LimitApplicationCertificateRelatedConsFlg;
    if (k == undefined) {
      return undefined;
    } else if (isLimitApplicationCertificateRelatedConsFlgCode(k)) {
      return LimitApplicationCertificateRelatedConsFlg[k];
    } else {
      throw new Error("Invalid LimitApplicationCertificateRelatedConsFlg: " + k);
    }
  }

  // 限度額適用認定証の情報について、患者の提供同意が得られた日時 (YYYY-MM-DD HH:mm:ss)
  get limitApplicationCertificateRelatedConsTime(): string | undefined {
    return onshiDateTimeOptToSqlDateTimeOpt(this.orig.LimitApplicationCertificateRelatedConsTime)
  }

  get gendogaku(): LimitApplicationCertificateRelatedInfo | undefined {
    return this.limitApplicationCertificateRelatedInfo;
  }

  // 特定疾病療養受療証の情報について、患者の提供同意を示す区分
  get specificDiseasesCertificateRelatedConsFlg(): SpecificDiseasesCertificateRelatedConsFlgLabel | undefined {
    const k: string | undefined = this.orig.SpecificDiseasesCertificateRelatedConsFlg;
    if (k == undefined) {
      return undefined;
    } else if (isSpecificDiseasesCertificateRelatedConsFlgCode(k)) {
      return SpecificDiseasesCertificateRelatedConsFlg[k];
    } else {
      throw new Error("Invalid SpecificDiseasesCertificateRelatedConsFlg: " + k);
    }
  }

  // 特定疾病療養受療証の情報について、患者の提供同意が得られた日時 (YYYY-MM-DD HH:mm:ss)
  get specificDiseasesCertificateRelatedConsTime(): string | undefined {
    return onshiDateTimeOptToSqlDateTimeOpt(this.orig.SpecificDiseasesCertificateRelatedConsTime);
  }

  toJSON(): object {
    return {
      ResultOfQualificationConfirmation: this.orig,
    }
  }

  static isResultOfQualificationConfirmationInterface(arg: any): arg is ResultOfQualificationConfirmationInterface {
    if (typeof arg === "object") {
      return castStringProp(arg, "InsuredCardClassification") &&
        castStringProp(arg, "Name") &&
        castStringProp(arg, "Sex1") &&
        castStringProp(arg, "Birthdate") &&
        castStringProp(arg, "InsurerName") &&
        castOptStringProp(arg, "InsurerNumber") &&
        castOptStringProp(arg, "InsuredCardSymbol") &&
        castOptStringProp(arg, "InsuredIdentificationNumber") &&
        castOptStringProp(arg, "InsuredBranchNumber") &&
        castOptStringProp(arg, "PersonalFamilyClassification") &&
        castOptStringProp(arg, "InsuredName") &&
        castOptStringProp(arg, "NameOfOther") &&
        castOptStringProp(arg, "NameKana") &&
        castOptStringProp(arg, "NameOfOtherKana") &&
        castOptStringProp(arg, "Sex2") &&
        castOptStringProp(arg, "Address") &&
        castOptStringProp(arg, "PostNumber") &&
        castOptStringProp(arg, "InsuredCertificateIssuanceDate") &&
        castOptStringProp(arg, "InsuredCardValidDate") &&
        castOptStringProp(arg, "InsuredCardExpirationDate") &&
        castOptStringProp(arg, "InsuredPartialContributionRatio") &&
        castOptStringProp(arg, "PreschoolClassification") &&
        castOptStringProp(arg, "ReasonOfLoss") &&
        castOptTest(arg.ElderlyRecipientCertificateInfo,
          ElderlyRecipientCertificateInfo.isElderlyRecipientCertificateInfoInterface) &&
        castOptStringProp(arg, "LimitApplicationCertificateRelatedConsFlg") &&
        castOptStringProp(arg, "LimitApplicationCertificateRelatedConsTime") &&
        castOptTest(arg.LimitApplicationCertificateRelatedInfo, LimitApplicationCertificateRelatedInfo.isLimitApplicationCertificateRelatedInfoInterface) &&
        castOptStringProp(arg, "SpecificDiseasesCertificateRelatedConsFlg") &&
        castOptStringProp(arg, "SpecificDiseasesCertificateRelatedConsTime") &&
        (arg.SpecificDiseasesCertificateList === undefined || (
          Array.isArray(arg.SpecificDiseasesCertificateList) &&
          arg.SpecificDiseasesCertificateList.every(SpecificDiseasesCertificateInfo.isSpecificDiseasesCertificateInfoInterface)
        ));
    } else {
      return false;
    }
  }

  static cast(arg: any): ResultOfQualificationConfirmation {
    if (this.isResultOfQualificationConfirmationInterface(arg)) {
      return new ResultOfQualificationConfirmation(arg);
    } else {
      throw new Error("Cannot create ResultOfQualificationConfirmation");
    }
  }
}
