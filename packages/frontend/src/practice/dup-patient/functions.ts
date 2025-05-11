import api from "@/lib/api";
import type { Appoint, DiseaseData, Kouhi, Koukikourei, Patient, Roujin, Shahokokuho, Visit } from "myclinic-model";
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

async function getLastVisit(visitIds: number[]): Promise<Visit | undefined> {
  if( visitIds.length > 0 ){
	let id = visitIds[visitIds.length - 1];
	return await api.getVisit(id)
  } else {
	return undefined;
  }
}

export async function getInfo(patient: Patient): Promise<PatientInfo> {
  let visitIds = await api.listVisitIdByPatientReverse(patient.patientId, 0, 100000);
  visitIds.reverse();
  
  return {
    patient,
    hokenInfo: await getHoken(patient.patientId),
    appoints: await getAppoints(patient.patientId),
    diseases: await api.listDiseaseEx(patient.patientId),
    visitIds,
    lastVisit: await getLastVisit(visitIds),
  }
}

export function createMerge(src: PatientInfo, dst: PatientInfo, cb: () => void):
() => Promise<void> {
  let dstPatientId = dst.patient.patientId;
  return async() => {
    await mergeVisit(src.visitIds, dstPatientId);
    await mergeAppoints(src.appoints, dstPatientId);
    await mergeDiseases(src.diseases, dstPatientId);
    await mergeHoken(src.hokenInfo, dstPatientId);
    await api.deletePatient(src.patient.patientId);
    let hokenOverlap = await checkCurrentDupHoken(dstPatientId);
    if( hokenOverlap ){
      alert(hokenOverlap);
    }
    cb();
  }
}

async function checkCurrentDupHoken(patientId: number): Promise<string | undefined> {
  let today = new Date();
  let shahokokuho = await api.listAvailableShahokokuho(patientId, today);
  let koukikourei = await api.listAvailableKoukikourei(patientId, today);
  if( shahokokuho.length + koukikourei.length > 1 ){
    return `hoken overlap (patient-id: ${patientId})`;
  } else {
    return undefined;
  }
}

async function mergeAppoints(srcAppoints: Appoint[], dstPatientId: number) {
  for(let appoint of srcAppoints) {
    appoint = Object.assign({}, appoint, { patientId: dstPatientId });
    await api.updateAppoint(appoint);
  }
}

async function mergeDiseases(diseases: DiseaseData[], dstPatientId: number) {
  for(let diseaseData of diseases) {
    let disease = diseaseData.disease;
    disease = Object.assign({}, disease, { patientId: dstPatientId });
    await api.updateDisease(disease);
  }
}

async function mergeShahokokuho(list: Shahokokuho[], dstPatientId: number) {
  for(let shahokokuho of list){
    shahokokuho = Object.assign({}, shahokokuho, { patientId: dstPatientId });
    await api.updateShahokokuho(shahokokuho);
  }
}

async function mergeKoukikourei(list: Koukikourei[], dstPatientId: number) {
  for(let koukikourei of list){
    koukikourei = Object.assign({}, koukikourei, { patientId: dstPatientId });
    await api.updateKoukikourei(koukikourei);
  }
}

async function mergeRoujin(list: Roujin[], dstPatientId: number) {
  for(let roujin of list){
    roujin = Object.assign({}, roujin, { patientId: dstPatientId });
    await api.updateRoujin(roujin);
  }
}

async function mergeKouhi(list: Kouhi[], dstPatientId: number) {
  for(let kouhi of list){
    kouhi = Object.assign({}, kouhi, { patientId: dstPatientId });
    await api.updateKouhi(kouhi);
  }
}

async function mergeHoken(hokenInfo: HokenInfo, dstPatientId: number) {
  await mergeShahokokuho(hokenInfo.shahokokuho, dstPatientId);
  await mergeKoukikourei(hokenInfo.koukikourei, dstPatientId);
  await mergeRoujin(hokenInfo.roujin, dstPatientId);
  await mergeKouhi(hokenInfo.kouhi, dstPatientId);
}

async function mergeVisit(visitIds: number[], dstPatientId: number) {
  for(let visitId of visitIds){
    let visit = await api.getVisit(visitId);
    visit.patientId = dstPatientId;
    await api.updateVisit(visit);
  }
}
