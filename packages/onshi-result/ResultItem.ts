import { InsuredCardClassificationLabel, PersonalFamilyClassificationLabel, SexLabel } from "codes";
import { ElderlyRecipientCertificateInfo } from "ElderlyRecipientCertificateInfo";
import { LimitApplicationCertificateRelatedInfo } from "LimitApplicationCertificateRelatedInfo";
import { ResultOfQualificationConfirmation, ResultOfQualificationConfirmationInterface } from "ResultOfQualificationConfirmation";
import { SpecificDiseasesCertificateInfo } from "SpecificDiseasesCertificateInfo";

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

  toJSON(): object {
    return this.orig;
  }

  static isResultItemInterface(arg: any): arg is ResultItemInterface {
    if (typeof arg === "object") {
      return ResultOfQualificationConfirmation.isResultOfQualificationConfirmationInterface(
        arg.ResultOfQualificationConfirmation
      )
    } else {
      return false;
    }
  }

  static cast(arg: any): ResultItem {
    if (this.isResultItemInterface(arg)) {
      return new ResultItem(arg);
    } else {
      throw new Error("Cannot create ResultItem");
    }
  }
}