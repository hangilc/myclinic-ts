import { ElderlyRecipientCertificateInfo } from "./ElderlyRecipientCertificateInfo";
import { LimitApplicationCertificateRelatedInfo } from "./LimitApplicationCertificateRelatedInfo";
import { castOptStringProp, castStringProp } from "./cast";
import { InsuredCardClassification, InsuredCardClassificationLabel, isInsuredCardClassificationCode, isPersonalFamilyClassificationCode, PersonalFamilyClassification, PersonalFamilyClassificationLabel } from "./codes";

interface ResultOfQualificationConfirmationInterface {
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
  ElderlyRecipientCertificateInfo: ElderlyRecipientCertificateInfo | undefined;
  LimitApplicationCertificateRelatedConsFlg: string | undefined;
  LimitApplicationCertificateRelatedConsTime: string | undefined;
  LimitApplicationCertificateRelatedInfo: LimitApplicationCertificateRelatedInfo | undefined;
  SpecificDiseasesCertificateRelatedConsFlg: string | undefined;
  SpecificDiseasesCertificateRelatedConsTime: string | undefined;
}

export class ResultOfQualificationConfirmation {
  orig: ResultOfQualificationConfirmationInterface;

  constructor(arg: ResultOfQualificationConfirmationInterface) {
    this.orig = arg;
  }

  // 被保険者証の種類
  get insuredCardClassification(): InsuredCardClassificationLabel {
    const k: string = this.orig.InsuredCardClassification;
    if( isInsuredCardClassificationCode(k) ){
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
    if( k == undefined ){
      return undefined;
    } else if( isPersonalFamilyClassificationCode(k) ){
      return PersonalFamilyClassification[k];
    } else {
      throw new Error("Invalid PersonalFamilyClassification: " + k);
    }
  }

  static cast(arg: any): ResultOfQualificationConfirmation {
    return new ResultOfQualificationConfirmation({
      InsuredCardClassification: castStringProp(arg, "InsuredCardClassification"),
      Name: castStringProp(arg, "Name"),
      Sex1: castStringProp(arg, "Sex1"),
      Birthdate: castStringProp(arg, "Birthdate"),
      InsurerName: castStringProp(arg, "InsurerName"),
      InsurerNumber: castOptStringProp(arg, "InsurerNumber"),
      InsuredCardSymbol: castOptStringProp(arg, "InsuredCardSymbol"),
      InsuredIdentificationNumber: castOptStringProp(arg, "InsuredIdentificationNumber"),
      InsuredBranchNumber: castOptStringProp(arg, "InsuredBranchNumber"),
      PersonalFamilyClassification: castOptStringProp(arg, "PersonalFamilyClassification"),
      InsuredName: castOptStringProp(arg, "InsuredName"),
      NameOfOther: castOptStringProp(arg, "NameOfOther"),
      NameKana: castOptStringProp(arg, "NameKana"),
      NameOfOtherKana: castOptStringProp(arg, "NameOfOtherKana"),
      Sex2: castOptStringProp(arg, "Sex2"),
      Address: castOptStringProp(arg, "Address"),
      PostNumber: castOptStringProp(arg, "PostNumber"),
      InsuredCertificateIssuanceDate: castOptStringProp(arg, "InsuredCertificateIssuanceDate"),
      InsuredCardValidDate: castOptStringProp(arg, "InsuredCardValidDate"),
      InsuredCardExpirationDate: castOptStringProp(arg, "InsuredCardExpirationDate"),
      InsuredPartialContributionRatio: castOptStringProp(arg, "InsuredPartialContributionRatio"),
      PreschoolClassification: castOptStringProp(arg, "PreschoolClassification"),
      ReasonOfLoss: castOptStringProp(arg, "ReasonOfLoss"),
      ElderlyRecipientCertificateInfo: castElderlyRecipientCertificateInfo(arg.ElderlyRecipientCertificateInfo),
      LimitApplicationCertificateRelatedConsFlg: castOptStringProp(arg, "LimitApplicationCertificateRelatedConsFlg"),
      LimitApplicationCertificateRelatedConsTime: castOptStringProp(arg, "LimitApplicationCertificateRelatedConsTime"),
      LimitApplicationCertificateRelatedInfo: castLimitApplicationCertificateRelatedInfo(arg.LimitApplicationCertificateRelatedInfo),
      SpecificDiseasesCertificateRelatedConsFlg: castOptStringProp(arg, "SpecificDiseasesCertificateRelatedConsFlg"),
      SpecificDiseasesCertificateRelatedConsTime: castOptStringProp(arg, "SpecificDiseasesCertificateRelatedConsTime"),
    });
  }
}

function castElderlyRecipientCertificateInfo(arg: any): ElderlyRecipientCertificateInfo | undefined {
  if (arg == undefined) {
    return undefined;
  } else {
    return ElderlyRecipientCertificateInfo.cast(arg);
  }
}

function castLimitApplicationCertificateRelatedInfo(arg: any):
  LimitApplicationCertificateRelatedInfo | undefined {
  if (arg == undefined) {
    return undefined;
  } else {
    return LimitApplicationCertificateRelatedInfo.cast(arg);
  }
}