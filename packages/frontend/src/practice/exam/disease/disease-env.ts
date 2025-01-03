import api from "@/lib/api";
import { CachedValue } from "@/lib/cached-value";
import type { Patient, VisitEx } from "myclinic-model";
import type { DiseaseData, DiseaseExample } from "myclinic-model/model";
import { DateWrapper } from "myclinic-util";
import type { Mode } from "./mode";
import { hasMatchingDrugDisease, type DrugDisease } from "@/lib/drug-disease";
import { cache } from "@/lib/cache";
import { extractDrugNames } from "./drugs-visit";

let drugsWithoutMatchingDiseaseIndex = 1;

export class DiseaseEnv {
  patient: Patient;
  currentList: DiseaseData[] = [];
  allList: DiseaseData[] | undefined = undefined;
  // examples: DiseaseExample[] = [];
  editTarget: DiseaseData | undefined = undefined;
  // today: Date = new Date();
  visits: VisitEx[] = [];
  mode: Mode = "current";
  // drugDiseases: DrugDisease[] = [];
  drugsWithoutMatchingDisease: {
    id: number;
    name: string;
    fixes: {
      pre: string[];
      name: string;
      post: string[];
    }[];
  }[] = [];

  // static examplesCache: CachedValue<DiseaseExample[]> = new CachedValue(
  //   api.listDiseaseExample
  // );

  constructor(
    patient: Patient
  ) {
    this.patient = patient;
  }

  async updateCurrentList() {
    this.currentList = await api.listCurrentDiseaseEx(this.patient.patientId);
  }

  async fetchAllList() {
    this.allList = await api.listDiseaseEx(this.patient.patientId);
  }

  clearAllList() {
    this.allList = undefined;
  }

  async updateAllList() {
    if (this.allList !== undefined) {
      await this.fetchAllList();
    }
  }

  async checkDrugs() {
    this.drugsWithoutMatchingDisease = [];
    const texts = this.visits.flatMap((visit) => visit.texts) ?? [];
    const drugNames: string[] = extractDrugNames(texts);
    const diseaseNames: string[] =
      this.currentList.map((disease) => {
        return disease.byoumeiMaster.name;
      });
    for (let drugName of drugNames) {
      const m = hasMatchingDrugDisease(drugName, diseaseNames, await cache.getDrugDiseases());
      if (m === true) {
        continue;
      } else {
        this.drugsWithoutMatchingDisease.push({
          id: drugsWithoutMatchingDiseaseIndex++,
          name: drugName,
          fixes: m,
        });
      }
    }
  }

  async checkShinryou() {

  }

  // addDisease(d: DiseaseData): void {
  //   this.currentList.push(d);
  //   if (this.allList !== undefined) {
  //     this.allList.push(d);
  //   }
  // }

  // updateDisease(d: DiseaseData): void {
  //   if (d.disease.isCurrentAt(this.today)) {
  //     const i = this.currentList.findIndex(e => e.disease.diseaseId === d.disease.diseaseId);
  //     if (i >= 0) {
  //       this.currentList.splice(i, 1, d);
  //     } else {
  //       this.currentList.push(d);
  //       this.currentList.sort((a, b) => a.disease.diseaseId - b.disease.diseaseId)
  //     }
  //   } else {
  //     const i = this.currentList.findIndex(e => e.disease.diseaseId === d.disease.diseaseId);
  //     if (i >= 0) {
  //       this.currentList.splice(i, 1);
  //     }
  //   }
  //   if (this.allList !== undefined) {
  //     const i = this.allList.findIndex(e => e.disease.diseaseId === d.disease.diseaseId);
  //     if (i >= 0) {
  //       this.allList.splice(i, 1, d);
  //     }
  //   }
  // }

  // remove(diseaseId: number): void {
  //   this.removeFromAllList(diseaseId);
  //   this.removeFromCurrentList([diseaseId]);
  // }

  // removeFromAllList(diseaseId: number): void {
  //   if (this.allList !== undefined) {
  //     this.allList = this.allList.filter(d => d.disease.diseaseId !== diseaseId);
  //   }
  // }

  // removeFromCurrentList(diseaseIds: number[]): void {
  //   this.currentList = this.currentList.filter(d => !diseaseIds.includes(d.disease.diseaseId));
  // }


  static async create(patient: Patient): Promise<DiseaseEnv> {
    const env = new DiseaseEnv(patient);
    await env.updateCurrentList();
    const today = DateWrapper.from(new Date()).asSqlDate();
    const visitIds = await api.listVisitIdByDateIntervalAndPatient(today, today, patient.patientId);
    let visits = await Promise.all(visitIds.map(visitId => api.getVisitEx(visitId)));
    env.visits = visits.filter(visit => visit.hoken.shahokokuho != undefined || visit.hoken.koukikourei != undefined);
    await env.checkDrugs();
    return env;
  }

}
