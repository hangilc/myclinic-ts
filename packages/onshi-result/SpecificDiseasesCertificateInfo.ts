import { castOptStringProp } from "./cast";

interface SpecificDiseasesCertificateInfoInterface {
  SpecificDiseasesDiseaseCategory: string | undefined;
  SpecificDiseasesCertificateDate: string | undefined;
  SpecificDiseasesValidStartDate: string | undefined;
  SpecificDiseasesValidEndDate: string | undefined;
  SpecificDiseasesSelfPay: string | undefined;
}

export class SpecificDiseasesCertificateInfo implements SpecificDiseasesCertificateInfoInterface {
  SpecificDiseasesDiseaseCategory: string | undefined;
  SpecificDiseasesCertificateDate: string | undefined;
  SpecificDiseasesValidStartDate: string | undefined;
  SpecificDiseasesValidEndDate: string | undefined;
  SpecificDiseasesSelfPay: string | undefined;

  constructor(arg: SpecificDiseasesCertificateInfoInterface){
    this.SpecificDiseasesDiseaseCategory = arg.SpecificDiseasesDiseaseCategory;
    this.SpecificDiseasesCertificateDate = arg.SpecificDiseasesCertificateDate;
    this.SpecificDiseasesValidStartDate = arg.SpecificDiseasesValidStartDate;
    this.SpecificDiseasesValidEndDate = arg.SpecificDiseasesValidEndDate;
    this.SpecificDiseasesSelfPay = arg.SpecificDiseasesSelfPay;
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