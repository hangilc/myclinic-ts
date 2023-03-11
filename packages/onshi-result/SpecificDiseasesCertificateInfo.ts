import { castOptStringProp } from "./cast";

interface SpecificDiseasesCertificateInfoInterface {
  SpecificDiseasesDiseaseCategory: string | undefined;
  SpecificDiseasesCertificateDate: string | undefined;
  SpecificDiseasesValidStartDate: string | undefined;
  SpecificDiseasesValidEndDate: string | undefined;
  SpecificDiseasesSelfPay: string | undefined;
}

export class SpecificDiseasesCertificateInfo {
  orig: SpecificDiseasesCertificateInfoInterface;

  constructor(arg: SpecificDiseasesCertificateInfoInterface) {
    this.orig = arg;
  }

  static cast(arg: any): SpecificDiseasesCertificateInfo {
    return new SpecificDiseasesCertificateInfo({
      SpecificDiseasesDiseaseCategory: castOptStringProp(arg, "SpecificDiseasesDiseaseCategory"),
      SpecificDiseasesCertificateDate: castOptStringProp(arg, "SpecificDiseasesCertificateDate"),
      SpecificDiseasesValidStartDate: castOptStringProp(arg, "SpecificDiseasesValidStartDate"),
      SpecificDiseasesValidEndDate: castOptStringProp(arg, "SpecificDiseasesValidEndDate"),
      SpecificDiseasesSelfPay: castOptStringProp(arg, "SpecificDiseasesSelfPay"),
    })
  }
}