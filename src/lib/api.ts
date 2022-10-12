import type * as m from "./model";
import { dateToSql } from "./util";
import type { Op as DrawerOp } from "./drawer/op";

export const base: string = getBase()
export const wsUrl: string = 
  base.replace("/api", "/ws/events").replace(/^http?/, "ws");

function getBase(): string {
  if( !import.meta.env.SSR ){
    const l = window.location;
    return `${l.protocol}//${l.hostname}:8080/api`;
  } else {
    return "http://localhost:8080/api";
  }
}

function get(cmd: string, params: any = {}): Promise<any> {
  let arg = `${base}/${cmd}`
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return fetch(arg).then(resp => resp.json());
}

function post(cmd: string, data: any, params: any = {}): Promise<any> {
  let arg = `${base}/${cmd}`
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return fetch(arg, { method: "POST", body: JSON.stringify(data) })
    .then(resp => resp.json());
}


export default {
  getPatient(patientId: number): Promise<m.Patient> {
    return get("get-patient", { "patient-id": patientId });
  },

  searchPatient(text: string): Promise<Array<m.Patient>> {
    return get("search-patient", { "text": text })
      .then(result => {
        const [_, list] = result;
        return list;
      });
  },

  async batchGetPatient(patientIds: number[]): Promise<Map<number, m.Patient>> {
    const result = await post("batch-get-patient", patientIds)
    const map: Map<number, m.Patient> = new Map();
    Object.entries(result).forEach(([k, v]: [string, any]) => {
      const p: m.Patient = v;
      map.set(parseInt(k), p);
    });
    return map;
  },

  async listWqueueFull(): Promise<Array<[m.Wqueue, m.Visit, m.Patient]>> {
    const [, wqList, vObj, pObj]: 
      [number, Array<m.Wqueue>, object, object]
      = await get("list-wqueue-full", {});
    const vMap: Map<number, m.Visit> = new Map();
    Object.entries(vObj).forEach(([k, v] : [string, any]) => {
      const visit: m.Visit = v;
      vMap.set(parseInt(k), visit);
    })
    const pMap: Map<number, m.Patient> = new Map();
    Object.entries(pObj).forEach(([k, v]: [string, any]) => {
      const patient: m.Patient = v;
      pMap.set(parseInt(k), patient);
    })
    return wqList.map(wq => {
      const visit = vMap.get(wq.visitId) as m.Visit;
      const patient = pMap.get(visit.patientId) as m.Patient;
      return [wq, visit, patient];
    });
  },

  changeWqueueState(visitId: number, wqueueState: number): Promise<m.Wqueue> {
    return get("change-wqueue-state", { "visit-id": visitId, "wqueue-state": wqueueState });
  },

  startVisit(patientId: number, at: string): Promise<m.Visit> {
    return get("start-visit", {"patient-id": patientId, "at": at});
  },

  listRecentVisit(offset: number, count: number): Promise<Array<m.Visit>> {
    return get("list-recent-visit", { offset, count });
  },

  listRecentVisitFull(offset: number, count: number): Promise<Array<[m.Visit, m.Patient]>> {
    return get("list-recent-visit-full", { offset, count });
  },

  listVisitByDate(date: Date): Promise<m.Visit[]> {
    const at = dateToSql(date);
    return get("list-visit-by-date", { at });
  },

  listVisitIdByPatientReverse(patientId: number, offset: number, count: number): Promise<number[]> {
    return get("list-visit-id-by-patient-reverse", {
      "patient-id": patientId, offset, count});
  },

  batchGetVisitEx(visitIds: number[]): Promise<m.VisitEx[]> {
      return post("batch-get-visit-ex", visitIds);
  },

  async listVisitEx(patientId: number, offset: number, count: number): Promise<m.VisitEx[]> {
    const visitIds: number[] = await this.listVisitIdByPatientReverse(patientId, offset, count);
    return this.batchGetVisitEx(visitIds);
  },

  countVisitByPatient(patientId: number): Promise<number> {
    return get("count-visit-by-patient", {"patient-id": patientId});
  },

  deleteVisit(visitId: number): Promise<boolean> {
    return get("delete-visit", { "visit-id": visitId });
  },

  deleteVisitFromReception(visitId: number): Promise<boolean> {
    return get("delete-visit-from-reception", { "visit-id": visitId });
  },

  enterText(text: m.Text): Promise<m.Text> {
    return post("enter-text", text);
  },

  updateText(text: m.Text): Promise<boolean> {
    return post("update-text", text);
  },

  deleteText(textId: number): Promise<boolean> {
    return get("delete-text", { "text-id": textId });
  },

  shohousenDrawer(textId: number): Promise<DrawerOp[]> {
    return get("shohousen-drawer", { "text-id": textId });
  },

  shohousenDrawerText(text: string): Promise<DrawerOp[]> {
    return post("shohousen-drawer", text);
  },



}