import { castOptStringProp } from "./cast";

interface LimitApplicationCertificateRelatedInfoInterface {
  LimitApplicationCertificateClassification: string | undefined;
  LimitApplicationCertificateClassificationFla: string | undefined;
  LimitApplicationCertificateDate: string | undefined;
  LimitApplicationCertificateValidStartDate: string | undefined;
  LimitApplicationCertificateValidEndDate: string | undefined;
  LimitApplicationCertificateLongTermDate: string | undefined;
}

export class LimitApplicationCertificateRelatedInfo {
  orig: LimitApplicationCertificateRelatedInfoInterface;

  constructor(arg: LimitApplicationCertificateRelatedInfoInterface) {
    this.orig = arg;
  }

  static cast(arg: any): LimitApplicationCertificateRelatedInfo {
    return new LimitApplicationCertificateRelatedInfo({
      LimitApplicationCertificateClassification: castOptStringProp(arg, "LimitApplicationCertificateClassification"),
      LimitApplicationCertificateClassificationFla: castOptStringProp(arg, "LimitApplicationCertificateClassificationFla"),
      LimitApplicationCertificateDate: castOptStringProp(arg, "LimitApplicationCertificateDate"),
      LimitApplicationCertificateValidStartDate: castOptStringProp(arg, "LimitApplicationCertificateValidStartDate"),
      LimitApplicationCertificateValidEndDate: castOptStringProp(arg, "LimitApplicationCertificateValidEndDate"),
      LimitApplicationCertificateLongTermDate: castOptStringProp(arg, "LimitApplicationCertificateLongTermDate"),
    });
  }
}


