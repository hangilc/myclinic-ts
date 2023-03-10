import { castOptStringProp } from "./cast";

interface ElderlyRecipientCertificateInfoInterface {
  ElderlyRecipientCertificateDate: string | undefined;
  ElderlyRecipientValidStartDate: string | undefined;
  ElderlyRecipientValidEndDate: string | undefined;
  ElderlyRecipientContributionRatio: string | undefined;
}

export class ElderlyRecipientCertificateInfo implements ElderlyRecipientCertificateInfoInterface {
  ElderlyRecipientCertificateDate: string | undefined;
  ElderlyRecipientValidStartDate: string | undefined;
  ElderlyRecipientValidEndDate: string | undefined;
  ElderlyRecipientContributionRatio: string | undefined;

  constructor(arg: ElderlyRecipientCertificateInfoInterface) {
    this.ElderlyRecipientCertificateDate = arg.ElderlyRecipientCertificateDate;
    this.ElderlyRecipientValidStartDate = arg.ElderlyRecipientValidStartDate;
    this.ElderlyRecipientValidEndDate = arg.ElderlyRecipientValidEndDate;
    this.ElderlyRecipientContributionRatio = arg.ElderlyRecipientContributionRatio;
  }

  static cast(arg: any): ElderlyRecipientCertificateInfo {
    if( typeof arg === "object" ){
      return new ElderlyRecipientCertificateInfo({
        ElderlyRecipientCertificateDate: castOptStringProp(arg, "ElderlyRecipientCertificateDate"),
        ElderlyRecipientValidStartDate: castOptStringProp(arg, "ElderlyRecipientValidStartDate"),
        ElderlyRecipientValidEndDate: castOptStringProp(arg, "ElderlyRecipientValidEndDate"),
        ElderlyRecipientContributionRatio: castOptStringProp(arg, "ElderlyRecipientContributionRatio"),
      });
    } else {
      throw new Error("Cannot convert to ElderlyRecipientCertificateInfo: " + arg);
    }
  }
}