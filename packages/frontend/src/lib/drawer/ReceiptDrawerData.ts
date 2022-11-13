import {
  type Patient,
  type Meisai,
  MeisaiObject,
  MeisaiSectionDataObject,
  MeisaiSectionEnum,
  type VisitEx,
} from "myclinic-model"
import { hokenRep } from "@/lib/hoken-rep"
import * as kanjidate from "kanjidate"

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
  hokengai: string[] = ["", "", "", ""]

  setPatient(patient: Patient): void {
    this.patientName = `${patient.lastName} ${patient.firstName}`
    this.patientId = patient.patientId.toString()
  }

  setMeisai(meisai: Meisai): void {
    const subtotal = MeisaiSectionDataObject.subtotalOf;
    const totalTen = MeisaiObject.totalTenOf;

    this.charge = meisai.charge
    if (meisai.futanWari == 10) {
      this.futanWari = "";
    } else {
      this.futanWari = meisai.futanWari.toString();
    }
    meisai.items.forEach(sect => {
      let ten: string;
      if (subtotal(sect) > 0) {
        ten = subtotal(sect).toString();
      } else {
        ten = "";
      }
      switch (sect.section) {
        case MeisaiSectionEnum.ShoshinSaisin: {
          this.shoshin = ten;
          break;
        }
        case MeisaiSectionEnum.IgakuKanri: {
          this.kanri = ten;
          break;
        }
        case MeisaiSectionEnum.Zaitaku: {
          this.zaitaku = ten;
          break;
        }
        case MeisaiSectionEnum.Kensa: {
          this.kensa = ten;
          break;
        }
        case MeisaiSectionEnum.Gazou: {
          this.gazou = ten;
          break;
        }
        case MeisaiSectionEnum.Touyaku: {
          this.touyaku = ten;
          break;
        }
        case MeisaiSectionEnum.Chuusha: {
          this.chuusha = ten;
          break;
        }
        case MeisaiSectionEnum.Shochi: {
          this.shochi = ten;
          break;
        }
        case MeisaiSectionEnum.Sonota: {
          this.sonota = ten;
          break;
        }
      }
      this.souten = totalTen(meisai).toString()
    });
  }

  setVisitDate(visitDate: Date): void {
    this.visitDate = kanjidate.format(kanjidate.f2, visitDate);
  }

  setIssueDate(issueDate: Date): void {
    this.issueDate = kanjidate.format(kanjidate.f2, issueDate);
  }

  static create(visit: VisitEx, meisai: Meisai): ReceiptDrawerData {
    const data = new ReceiptDrawerData();
    data.setPatient(visit.patient)
    data.setMeisai(meisai);
    data.setVisitDate(new Date(visit.visitedAt));
    data.setIssueDate(new Date());
    data.hoken = hokenRep(visit)
    return data;
  }

}

