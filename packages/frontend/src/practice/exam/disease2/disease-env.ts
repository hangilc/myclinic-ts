import api from "@/lib/api";
import { CachedValue } from "@/lib/cached-value";
import type { Patient } from "myclinic-model";
import type { DiseaseData, DiseaseExample } from "myclinic-model/model";

export class DiseaseEnv {
  patient: Patient;
  currentList: DiseaseData[];
  allList: DiseaseData[] | undefined = undefined;
  examples: DiseaseExample[];

  static examplesCache: CachedValue<DiseaseExample[]> = new CachedValue(
    api.listDiseaseExample
  );

  constructor(
    patient: Patient,
    currentList: DiseaseData[],
    examples: DiseaseExample[]
  ) {
    this.patient = patient;
    this.currentList = [...currentList];
    this.examples = examples;
  }

  addDisease(d: DiseaseData): void {
    this.currentList.push(d);
    if( this.allList !== undefined ){
      this.allList.push(d);
    }
  }

  static async create(patient: Patient): Promise<DiseaseEnv> {
    const cur = await api.listCurrentDiseaseEx(patient.patientId);
    const examples = await DiseaseEnv.examplesCache.get();
    return new DiseaseEnv(patient, cur, examples);
  }
}
