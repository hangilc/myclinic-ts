import type { InsuredCardClassificationLabel, LimitApplicationCertificateRelatedConsFlgLabel, PersonalFamilyClassificationLabel, PreschoolClassificationLabel, ReasonOfLossLabel, SexLabel, SpecificDiseasesCertificateRelatedConsFlgLabel } from "./codes";
import type { ElderlyRecipientCertificateInfo } from "./ElderlyRecipientCertificateInfo";
import type { LimitApplicationCertificateRelatedInfo } from "./LimitApplicationCertificateRelatedInfo";
import { ResultOfQualificationConfirmation, type ResultOfQualificationConfirmationInterface } from "./ResultOfQualificationConfirmation";
import type { SpecificDiseasesCertificateInfo } from "./SpecificDiseasesCertificateInfo";

export interface ResultItemInterface {
  ResultOfQualificationConfirmation: ResultOfQualificationConfirmationInterface;
}

export class ResultItem {
  orig: ResultItemInterface;
  resultOfQualificationConfirmation: ResultOfQualificationConfirmation

  constructor(orig: ResultItemInterface) {
    this.orig = orig;
    this.resultOfQualificationConfirmation =
      ResultOfQualificationConfirmation.cast(orig.ResultOfQualificationConfirmation);
  }

  get elderlyRecipientCertificateInfo(): ElderlyRecipientCertificateInfo | undefined {
    return this.resultOfQualificationConfirmation.elderlyRecipientCertificateInfo;
  }

  get limitApplicationCertificateRelatedInfo(): LimitApplicationCertificateRelatedInfo | undefined {
    return this.resultOfQualificationConfirmation.limitApplicationCertificateRelatedInfo;
  }

  get specificDiseasesCertificateList(): SpecificDiseasesCertificateInfo[] {
    return this.resultOfQualificationConfirmation.specificDiseasesCertificateList;
  }

  get insuredCardClassification(): InsuredCardClassificationLabel {
    return this.resultOfQualificationConfirmation.insuredCardClassification;
  }

  get insurerNumber(): string | undefined {
    return this.resultOfQualificationConfirmation.insurerNumber;
  }

  get insuredCardSymbol(): string | undefined {
    return this.resultOfQualificationConfirmation.insuredCardSymbol;
  }

  get insuredIdentificationNumber(): string | undefined {
    return this.resultOfQualificationConfirmation.insuredIdentificationNumber;
  }

  get insuredBranchNumber(): string | undefined {
    return this.resultOfQualificationConfirmation.insuredBranchNumber;
  }

  get personalFamilyClassification(): PersonalFamilyClassificationLabel | undefined {
    return this.resultOfQualificationConfirmation.personalFamilyClassification;
  }

  get honninStore(): number | undefined {
    return this.resultOfQualificationConfirmation.honninStore;
  }

  get insuredName(): string | undefined {
    return this.resultOfQualificationConfirmation.insuredName;
  }

  get name(): string {
    return this.resultOfQualificationConfirmation.name;
  }

  get nameOfOther(): string | undefined {
    return this.resultOfQualificationConfirmation.nameOfOther;
  }

  get nameKana(): string | undefined {
    return this.resultOfQualificationConfirmation.nameKana;
  }

  get nameOfOtherKana(): string | undefined {
    return this.resultOfQualificationConfirmation.nameOfOtherKana;
  }

  get sex1(): SexLabel {
    return this.resultOfQualificationConfirmation.sex1;
  }

  get sex(): SexLabel {
    return this.resultOfQualificationConfirmation.sex;
  }

  get sex2(): SexLabel | undefined {
    return this.resultOfQualificationConfirmation.sex2;
  }

  get birthdate(): string {
    return this.resultOfQualificationConfirmation.birthdate;
  }

  get address(): string | undefined {
    return this.resultOfQualificationConfirmation.address;
  }

  get postNumber(): string | undefined {
    return this.resultOfQualificationConfirmation.postNumber;
  }

  get insuredCertificateIssuanceDate(): string | undefined {
    return this.resultOfQualificationConfirmation.insuredCertificateIssuanceDate;
  }

  get insuredCardValidDate(): string | undefined {
    return this.resultOfQualificationConfirmation.insuredCardValidDate;
  }

  get insuredCardExpirationDate(): string | undefined {
    return this.resultOfQualificationConfirmation.insuredCardExpirationDate;
  }

  get insuredPartialContributionRatio(): number | undefined {
    return this.resultOfQualificationConfirmation.insuredPartialContributionRatio;
  }

  get koukikoureiFutanWari(): number | undefined {
    return this.resultOfQualificationConfirmation.koukikoureiFutanWari;
  }

  get preschoolClassification(): PreschoolClassificationLabel | undefined {
    return this.resultOfQualificationConfirmation.preschoolClassification;
  }

  get reasonOfLoss(): ReasonOfLossLabel | undefined {
    return this.resultOfQualificationConfirmation.reasonOfLoss
  }

  get insurerName(): string {
    return this.resultOfQualificationConfirmation.insurerName;
  }

  get kourei(): ElderlyRecipientCertificateInfo | undefined {
    return this.resultOfQualificationConfirmation.kourei;
  }

  get limitApplicationCertificateRelatedConsFlg(): LimitApplicationCertificateRelatedConsFlgLabel | undefined {
    return this.resultOfQualificationConfirmation.limitApplicationCertificateRelatedConsFlg;
  }

  get limitApplicationCertificateRelatedConsTime(): string | undefined {
    return this.resultOfQualificationConfirmation.limitApplicationCertificateRelatedConsTime;
  }

  get gendogaku(): LimitApplicationCertificateRelatedInfo | undefined {
    return this.resultOfQualificationConfirmation.gendogaku;
  }

  get specificDiseasesCertificateRelatedConsFlg(): SpecificDiseasesCertificateRelatedConsFlgLabel | undefined {
    return this.resultOfQualificationConfirmation.specificDiseasesCertificateRelatedConsFlg;
  }

  get specificDiseasesCertificateRelatedConsTime(): string | undefined {
    return this.resultOfQualificationConfirmation.specificDiseasesCertificateRelatedConsTime;
  }

  toJSON(): object {
    return this.orig;
  }

  static isResultItemInterface(arg: any): arg is ResultItemInterface {
    if (typeof arg === "object") {
      return ResultOfQualificationConfirmation.isResultOfQualificationConfirmationInterface(
        arg.ResultOfQualificationConfirmation
      )
    } else {
      console.error("is not object (isResultItemInterface)");
      return false;
    }
  }

  static cast(arg: any): ResultItem {
    if (ResultItem.isResultItemInterface(arg)) {
      return new ResultItem(arg);
    } else {
      throw new Error("Cannot create ResultItem");
    }
  }
}