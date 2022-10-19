import type * as m from "./model"
import { dateToSql } from "./util"
import type { Op as DrawerOp, Op } from "./drawer/op"
import type { ReceiptDrawerData } from "./drawer/ReceiptDrawerData"

export const backend: string = getBackend();
export const base: string = backend + "/api";
export const wsUrl: string = 
  base.replace("/api", "/ws/events").replace(/^http?/, "ws");

function getBackend(): string {
  if( !import.meta.env.SSR ){
    const l = window.location;
    return `${l.protocol}//${l.hostname}:8080`;
  } else {
    return "http://localhost:8080";
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

function dateParam(arg: Date | string): string {
  if( typeof arg !== "string" ){
    return dateToSql(arg);
  } else {
    return arg.length > 10 ? arg.substring(0, 10) : arg;
  }
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

  updateVisit(visit: m.Visit): Promise<boolean> {
    return post("update-visit", visit);
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

  getVisitEx(visitId: number): Promise<m.VisitEx> {
    return get("get-visit-ex", { "visit-id": visitId });
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

  enterPayment(payment: m.Payment): Promise<boolean> {
    return post("enter-payment", payment);
  },

  shohousenDrawer(textId: number): Promise<DrawerOp[]> {
    return get("shohousen-drawer", { "text-id": textId });
  },

  shohousenDrawerText(text: string): Promise<DrawerOp[]> {
    return post("shohousen-drawer", text);
  },

  getMeisai(visitId: number): Promise<m.Meisai> {
    return get("get-meisai", { "visit-id": visitId });
  },

  drawReceipt(data: ReceiptDrawerData): Promise<Op[]> {
    return post("draw-receipt", data);
  },

  createPdfFile(ops: Op[], paperSize: string, fileName: string): Promise<boolean> {
    return post("create-pdf-file", ops, { "paper-size": paperSize, "file-name": fileName });
  },

  stampPdf(fileName: string, stamp: string): Promise<boolean> {
    return get("stamp-pdf", { "file-name": fileName, "stamp": stamp });
  },

  concatPdfFiles(files: string[], outFile: string): Promise<boolean> {
    return post("concat-pdf-files", files, { "out-file": outFile });
  },

  deletePortalTmpFile(fileName: string): Promise<boolean> {
    return get("delete-portal-tmp-file", { "file-name": fileName });
  },

  portalTmpFileUrl(fileName: string): string {
    return `${backend}/portal-tmp/${fileName}`;
  },

  findAvailableShahokokuho(patientId: number, at: Date | string): 
    Promise<m.Shahokokuho | null > {
    return get("find-available-shahokokuho", { 
      "patient-id": patientId, at: dateParam(at)
    })
  },

  findAvailableRoujin(patientId: number, at: Date | string): 
    Promise<m.Roujin | null > {
    return get("find-available-roujin", { 
      "patient-id": patientId, 
      at: dateParam(at) 
    })
  },

  findAvailableKoukikourei(patientId: number, at: Date | string): 
    Promise<m.Koukikourei | null > {
    return get("find-available-koukikourei", { 
      "patient-id": patientId, 
      at: dateParam(at) 
    })
  },

  listAvailableKouhi(patientId: number, at: Date | string): 
    Promise<m.Kouhi[]> {
    return get("list-available-kouhi", { 
      "patient-id": patientId, 
      at: dateParam(at)
    })
  },

  updateHokenIds(visitId: number, hokenIdSet: m.HokenIdSet): Promise<boolean> {
    return post("update-hoken-ids", hokenIdSet, { "visit-id": visitId });
  },

  getShinryouRegular(): Promise<Record<string, string[]>> {
    return get("get-shinryou-regular", {});
  },

  getShinryouKensa(): Promise<Record<string, string[]>> {
    return get("get-shinryou-kensa", {});
  },

  resolveShinryoucodeByName(name: string, at: Date | string): Promise<number | null> {
    return get("resolve-shinryoucode-by-name", { 
      "name": name, 
      at: dateParam(at) 
    });
  },

  resolveKizaicodeByName(name: string, at: Date | string): Promise<number | null> {
    return get("resolve-kizaicode-by-name", { 
      "name": name, 
      at: dateParam(at) 
    });
  },

  batchEnterShinryouConduct(req: m.CreateShinryouConductRequest):
      Promise<[number[], number[]]> {
    return post("batch-enter-shinryou-conduct", req);        
  },

}