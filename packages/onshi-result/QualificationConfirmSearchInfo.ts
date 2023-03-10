import { toSqlDate } from "./util";
import { castOptStringProp, castStringProp } from "./cast";
import { isLimitApplicationCertificateRelatedConsFlgCode, LimitApplicationCertificateRelatedConsFlg, LimitApplicationCertificateRelatedConsFlgLabel } from "./codes";

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

  // 券面記載の保険者番号
  get insurerNumber(): string {
    return this.InsurerNumber;
  }

  // 券面記載の被保険者証記号
  get insuredCardSymbol(): string | undefined {
    return this.InsuredCardSymbol;
  }

  // 券面記載の被保険者証番号
  get insuredIdentificationNumber(): string {
    return this.InsuredIdentificationNumber;
  }

  // 加入者の被保険者証記号・番号単位に設定した枝番（2桁の番号）
  get insuredBranchNumber(): string | undefined {
    return this.InsuredBranchNumber;
  }

  // 券面の生年月日 (YYYY-MM-DD)
  get birthdate(): string {
    return toSqlDate(this.Birthdate);
  }

  // 限度額適用認定証の情報について、患者の提供同意を示す区分
  get limitApplicationCertificateRelatedConsFlg(): LimitApplicationCertificateRelatedConsFlgLabel {
    const k: string = this.LimitApplicationCertificateRelatedConsFlg;
    if (isLimitApplicationCertificateRelatedConsFlgCode(k)) {
      return LimitApplicationCertificateRelatedConsFlg[k];
    } else {
      throw new Error("Invalid LimitApplicationCertificateRelatedConsFlg: " + k);
    }
  }

  // 医療機関ごとに使用できる項目（使用は任意）
  get arbitraryIdentifier(): string | undefined {
    return this.ArbitraryIdentifier;
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

