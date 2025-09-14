import {
  type Patient,
  type VisitEx,
  ClinicInfo,
} from "myclinic-model"
import { hokenRep } from "@/lib/hoken-rep"
import { MeisaiWrapper } from "@/lib/rezept-meisai"
import { FormatDate } from "myclinic-util";

export class ReceiptDrawerData {
  patientName: string = "";
  charge: number = 0;
  visitDate: string = "";
  issueDate: string = "";
  patientId: string = "";
  hoken: string = "";
  futanWari: string = "";
  shoshin: string = "";
  kanri: string = "";
  zaitaku: string = "";
  kensa: string = "";
  gazou: string = "";
  touyaku: string = "";
  chuusha: string = "";
  shochi: string = "";
  sonota: string = "";
  souten: string = "";
  hokengai: string[] = [];
  clinicName: string = "";
  addressLines: string[] = [];

  setPatient(patient: Patient, name?: string): void {
    this.patientName = name ?? `${patient.lastName} ${patient.firstName}`;
    this.patientId = patient.patientId.toString();
  }

  setMeisai(meisai: MeisaiWrapper): void {
    // this.charge = meisai.charge
    if (meisai.futanWari == 10) {
      this.futanWari = "";
    } else {
      this.futanWari = meisai.futanWari.toString();
    }
    for(const [sect, data] of meisai.getGrouped()){
      console.log(data);
      let ten: string;
      if (data.sectionTotalTen > 0) {
        ten = data.sectionTotalTen.toLocaleString();
      } else {
        ten = "";
      }
      switch (sect) {
        case "初・再診料": {
          this.shoshin = ten;
          break;
        }
        case "医学管理等": {
          this.kanri = ten;
          break;
        }
        case "在宅医療": {
          this.zaitaku = ten;
          break;
        }
        case "検査": {
          this.kensa = ten;
          break;
        }
        case "画像診断": {
          this.gazou = ten;
          break;
        }
        case "投薬": {
          this.touyaku = ten;
          break;
        }
        case "注射": {
          this.chuusha = ten;
          break;
        }
        case "処置": {
          this.shochi = ten;
          break;
        }
        case "その他": {
          this.sonota = ten;
          break;
        }
      }
    }
    this.souten = meisai.totalTen().toLocaleString();
  }

  setVisitDate(visitDate: Date): void {
    this.visitDate = FormatDate.f2(visitDate);
  }

  setIssueDate(issueDate: Date): void {
    this.issueDate = FormatDate.f2(issueDate);
  }

  setClinic(clinicInfo: ClinicInfo): void {
    this.clinicName = clinicInfo.name;
    this.addressLines = [
      clinicInfo.postalCode,
      clinicInfo.address,
      clinicInfo.tel,
      clinicInfo.fax,
      clinicInfo.homepage
    ];
  }

  static create(visit: VisitEx, meisai: MeisaiWrapper, clinicInfo: ClinicInfo): ReceiptDrawerData {
    const attr = JSON.parse(visit.attributesStore ?? "{}");
    const data = new ReceiptDrawerData();
    data.setPatient(visit.patient, attr.cashierReceiptName);
    data.setMeisai(meisai);
    data.setVisitDate(new Date(visit.visitedAt));
    data.setIssueDate(new Date());
    data.hoken = hokenRep(visit);
    data.setClinic(clinicInfo);
    data.charge = visit.chargeOption?.charge ?? 0;
    data.hokengai = attr.hokengai ?? [];
    return data;
  }

}

