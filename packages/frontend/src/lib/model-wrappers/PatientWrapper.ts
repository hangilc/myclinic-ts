import type { Patient } from "myclinic-model";
import type { PatientMemo } from "myclinic-model/model";
import api from "../api";

export class PatientWrapper {
  patient: Patient;

  constructor(patient: Patient) {
    this.patient = patient;
  }

  getMemo(): PatientMemo {
    const memoStore = this.patient.memo;
    let memo = { };
    if( memoStore !== undefined ){
      const json = JSON.parse(memoStore);
      memo = Object.assign(memo, json);
    }
    return memo;
  }

  setMemo(memo: PatientMemo | undefined) {
    let m: string | undefined = undefined;
    if( memo !== undefined ){
      const json = JSON.parse(JSON.stringify(memo));
      if( Object.keys(json).length > 0 ){
        m = JSON.stringify(json);
      }
    }
    this.patient.memo = m;
  }

  async savePatient() {
    console.log("memo", this.patient.memo);
    await api.updatePatient(this.patient);
  }

  getMainDisease(): string | undefined {
    return this.getMemo()["main-diesase"];
  }

  setMainDisease(disease: string | undefined) {
    const memo = this.getMemo();
    memo["main-diesase"] = disease;
    this.setMemo(memo);
  }
}

