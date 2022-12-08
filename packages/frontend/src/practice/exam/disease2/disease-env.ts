import api from "@/lib/api";
import type { Patient } from "myclinic-model";
import type { DiseaseData } from "myclinic-model/model";

export class DiseaseEnv {
  patient: Patient;
  currentList: DiseaseData[];
  allList: DiseaseData[] | undefined = undefined;

  constructor(patient: Patient, currentList: DiseaseData[]) {
    this.patient = patient;
    currentList = [...currentList];
    
    this.currentList = currentList;
  }

  static async create(patient: Patient): Promise<DiseaseEnv> {
    const cur = await api.listCurrentDiseaseEx(patient.patientId);
    return new DiseaseEnv(patient, cur);
  }
}