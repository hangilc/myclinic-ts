import { castOptStringProp } from "./cast";

interface LimitApplicationCertificateRelatedInfoInterface {
  LimitApplicationCertificateClassification: string | undefined;
  LimitApplicationCertificateClassificationFla: string | undefined;
  LimitApplicationCertificateDate: string | undefined;
  LimitApplicationCertificateValidStartDate: string | undefined;
  LimitApplicationCertificateValidEndDate: string | undefined;
  LimitApplicationCertificateLongTermDate: string | undefined;
}

export class LimitApplicationCertificateRelatedInfo
  implements LimitApplicationCertificateRelatedInfoInterface {
  LimitApplicationCertificateClassification: string | undefined;
  LimitApplicationCertificateClassificationFla: string | undefined;
  LimitApplicationCertificateDate: string | undefined;
  LimitApplicationCertificateValidStartDate: string | undefined;
  LimitApplicationCertificateValidEndDate: string | undefined;
  LimitApplicationCertificateLongTermDate: string | undefined;

  constructor(arg: LimitApplicationCertificateRelatedInfoInterface) {
    this.LimitApplicationCertificateClassification = arg.LimitApplicationCertificateClassification;
    this.LimitApplicationCertificateClassificationFla = arg.LimitApplicationCertificateClassificationFla;
    this.LimitApplicationCertificateDate = arg.LimitApplicationCertificateDate;
    this.LimitApplicationCertificateValidStartDate = arg.LimitApplicationCertificateValidStartDate;
    this.LimitApplicationCertificateValidEndDate = arg.LimitApplicationCertificateValidEndDate;
    this.LimitApplicationCertificateLongTermDate = arg.LimitApplicationCertificateLongTermDate;
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


