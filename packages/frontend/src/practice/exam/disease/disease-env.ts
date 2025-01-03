import api from "@/lib/api";
import { CachedValue } from "@/lib/cached-value";
import type { Patient, VisitEx } from "myclinic-model";
import type { DiseaseData, DiseaseExample } from "myclinic-model/model";
import { DateWrapper } from "myclinic-util";
import type { Mode } from "./mode";

export class DiseaseEnv {
  patient: Patient;
  currentList: DiseaseData[];
  allList: DiseaseData[] | undefined = undefined;
  examples: DiseaseExample[];
  editTarget: DiseaseData | undefined = undefined;
  today: Date = new Date();
  visits: VisitEx[] = [];
  mode: Mode = "current";

  static examplesCache: CachedValue<DiseaseExample[]> = new CachedValue(
    api.listDiseaseExample
  );

  constructor(
    patient: Patient,
    currentList: DiseaseData[],
    examples: DiseaseExample[],
    visits?: VisitEx[],
  ) {
    this.patient = patient;
    this.currentList = [...currentList];
    this.examples = examples;
    this.visits = visits ?? [];
  }

  addDisease(d: DiseaseData): void {
    this.currentList.push(d);
    if( this.allList !== undefined ){
      this.allList.push(d);
    }
  }

  updateDisease(d: DiseaseData): void {
    if( d.disease.isCurrentAt(this.today)) {
      const i = this.currentList.findIndex(e => e.disease.diseaseId === d.disease.diseaseId);
      if( i >= 0 ){
        this.currentList.splice(i, 1, d);
      } else {
        this.currentList.push(d);
        this.currentList.sort((a, b) => a.disease.diseaseId - b.disease.diseaseId)
      }
    } else {
      const i = this.currentList.findIndex(e => e.disease.diseaseId === d.disease.diseaseId);
      if( i >= 0 ){
        this.currentList.splice(i, 1);
      }    
    }
    if( this.allList !== undefined ){
      const i = this.allList.findIndex(e => e.disease.diseaseId === d.disease.diseaseId);
      if( i >= 0 ){
        this.allList.splice(i, 1, d);
      }
    }
  }

  remove(diseaseId: number): void {
    this.removeFromAllList(diseaseId);
    this.removeFromCurrentList([diseaseId]);
  }

  removeFromAllList(diseaseId: number): void {
    if( this.allList !== undefined ){
      this.allList = this.allList.filter(d => d.disease.diseaseId !== diseaseId);
    }
  }

  removeFromCurrentList(diseaseIds: number[]): void {
    this.currentList = this.currentList.filter(d => !diseaseIds.includes(d.disease.diseaseId));
  }

  async fetchAllList() {
    if( this.allList === undefined ){
      this.allList = await api.listDiseaseEx(this.patient.patientId);
    }
  }

  static async create(patient: Patient): Promise<DiseaseEnv> {
    const cur = await api.listCurrentDiseaseEx(patient.patientId);
    const examples = await DiseaseEnv.examplesCache.get();
    const today = DateWrapper.from(new Date()).asSqlDate();
    const visitIds = await api.listVisitIdByDateIntervalAndPatient(today, today, patient.patientId);
    let visits = await Promise.all(visitIds.map(visitId => api.getVisitEx(visitId)));
    visits = visits.filter(visit => visit.hoken.shahokokuho != undefined || visit.hoken.koukikourei != undefined);
    return new DiseaseEnv(patient, cur, examples, visits);
  }

}
