import { castOptStringProp, castStringProp } from "./cast";

interface QualificationConfirmSearchInfoInterface {
  InsurerNumber: string;
  InsuredIdentificationNumber: string;
  Birthdate: string;
  LimitApplicationCertificateRelatedConsFlg: string;
  InsuredCardSymbol: string | undefined;
  InsuredBranchNumber: string | undefined;
  ArbitraryIdentifier: string | undefined;
}

export class QualificationConfirmSearchInfo implements QualificationConfirmSearchInfoInterface {
  InsurerNumber: string;
  InsuredIdentificationNumber: string;
  Birthdate: string;
  LimitApplicationCertificateRelatedConsFlg: string;
  InsuredCardSymbol: string | undefined;
  InsuredBranchNumber: string | undefined;
  ArbitraryIdentifier: string | undefined;

  constructor(arg: QualificationConfirmSearchInfoInterface) {
    this.InsurerNumber = arg.InsurerNumber;
    this.InsuredIdentificationNumber = arg.InsuredIdentificationNumber;
    this.Birthdate = arg.Birthdate;
    this.LimitApplicationCertificateRelatedConsFlg = arg.LimitApplicationCertificateRelatedConsFlg;
    this.InsuredCardSymbol = arg.InsuredCardSymbol;
    this.InsuredBranchNumber = arg.InsuredBranchNumber;
    this.ArbitraryIdentifier = arg.ArbitraryIdentifier;
  }

  static cast(arg: any): QualificationConfirmSearchInfo {
    if (typeof arg === "object") {
      return new QualificationConfirmSearchInfo({
        InsurerNumber: castStringProp(arg, "InsurerNumber"),
        InsuredIdentificationNumber: castStringProp(arg, "InsuredIdentificationNumber"),
        Birthdate: castStringProp(arg, "Birthdate"),
        LimitApplicationCertificateRelatedConsFlg: castStringProp(arg, "LimitApplicationCertificateRelatedConsFlg"),
        InsuredCardSymbol: castOptStringProp(arg, "InsuredCardSymbol"),
        InsuredBranchNumber: castOptStringProp(arg, "InsuredBranchNumber"),
        ArbitraryIdentifier: castOptStringProp(arg, "ArbitraryIdentifier"),
      });
    } else {
      throw new Error("Cannot convert to " + QualificationConfirmSearchInfo);
    }
  }
}

