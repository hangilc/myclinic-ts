import { ElderlyRecipientCertificateInfo } from "./ElderlyRecipientCertificateInfo";
import { castOptStringProp, castStringProp } from "./cast";

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
}

export class ResultOfQualificationConfirmation implements ResultOfQualificationConfirmationInterface {
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
  InsuredPartialContributionRatio: string | undefined; // 後期高齢者の一部負担割合
  PreschoolClassification: string | undefined; 
  ReasonOfLoss: string | undefined; 
  ElderlyRecipientCertificateInfo: ElderlyRecipientCertificateInfo | undefined;

  constructor(arg: ResultOfQualificationConfirmationInterface) {
    this.InsuredCardClassification = arg.InsuredCardClassification;
    this.Name = arg.Name;
    this.Sex1 = arg.Sex1;
    this.Birthdate = arg.Birthdate;
    this.InsurerName = arg.InsurerName;
    this.InsurerNumber = arg.InsurerNumber;
    this.InsuredCardSymbol = arg.InsuredCardSymbol;
    this.InsuredIdentificationNumber = arg.InsuredIdentificationNumber;
    this.InsuredBranchNumber = arg.InsuredBranchNumber;
    this.PersonalFamilyClassification = arg.PersonalFamilyClassification;
    this.InsuredName = arg.InsuredName;
    this.NameOfOther = arg.NameOfOther;
    this.NameKana = arg.NameKana;
    this.NameOfOtherKana = arg.NameOfOtherKana;
    this.Sex2 = arg.Sex2;
    this.Address = arg.Address;
    this.PostNumber = arg.PostNumber;
    this.InsuredCertificateIssuanceDate = arg.InsuredCertificateIssuanceDate;
    this.InsuredCardValidDate = arg.InsuredCardValidDate;
    this.InsuredCardExpirationDate = arg.InsuredCardExpirationDate;
    this.InsuredPartialContributionRatio = arg.InsuredPartialContributionRatio;
    this.PreschoolClassification = arg.PreschoolClassification;
    this.ReasonOfLoss = arg.ReasonOfLoss;
    this.ElderlyRecipientCertificateInfo = arg.ElderlyRecipientCertificateInfo;
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
    });
  }
}

function castElderlyRecipientCertificateInfo(arg: any): ElderlyRecipientCertificateInfo | undefined {
  if( arg == undefined ){
    return undefined;
  } else {
    return ElderlyRecipientCertificateInfo.cast(arg);
  }
}