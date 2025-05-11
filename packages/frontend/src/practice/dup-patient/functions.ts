import api from "@/lib/api";
import type { Appoint, Patient } from "myclinic-model";
import type { HokenInfo, PatientInfo } from "./dup-patient";

let serialId = 1;

export interface DupWrapper {
  id: number;
  patient1: Patient;
  patient2: Patient;
  detail: boolean;
}

export async function searchDupPatient(): Promise<DupWrapper[]> {
  let result = await api.searchDupPatient();
  return result.map(r => Object.assign(r, { id: serialId++, detail: false  }));
}

export async function getHoken(patientId: number): Promise<HokenInfo> {
  const [shahokokuho, koukikourei, roujin, kouhi] = await api.listAllHoken(patientId);
  shahokokuho.sort((a, b) => a.shahokokuhoId - b.shahokokuhoId);
  koukikourei.sort((a, b) => a.koukikoureiId - b.koukikoureiId);
  roujin.sort((a, b) => a.roujinId - b.roujinId);
  kouhi.sort((a, b) => a.kouhiId - b.kouhiId);
  return { shahokokuho, koukikourei, roujin, kouhi };
}

export function hasNoHoken(info: HokenInfo): boolean {
  return info.shahokokuho.length === 0 &&
    info.koukikourei.length === 0 &&
    info.roujin.length === 0 &&
    info.kouhi.length === 0;
}

export async function getAppoints(patientId: number): Promise<Appoint[]> {
  let result = await api.searchAppointByPatientId(patientId);
  return result.map(e => e[0]);
}

export async function getInfo(patient: Patient): Promise<PatientInfo> {
  return {
    patient,
    hokenInfo: await getHoken(patient.patientId),
    appoints: await getAppoints(patient.patientId),
    diseases: await api.listDiseaseEx(patient.patientId),
    visitIds: (await api.listVisitIdByPatientReverse(patient.patientId, 0, 100000)).reverse()
  }
}

export function createMerge(src: PatientInfo, dst: PatientInfo, cb: () => void):
(() => Promise<void>) | undefined {
  if( hasNoHoken(src.hokenInfo) && src.appoints.length === 0 &&
    src.diseases.length === 0 ){
      return async() => {
        for(let visitId of src.visitIds){
          let visit = await api.getVisit(visitId);
          visit.patientId = dst.patient.patientId;
          await api.updateVisit(visit);
        }
        await api.deletePatient(src.patient.patientId);
        cb();
      }
    } else {
      return undefined;
    }
}
