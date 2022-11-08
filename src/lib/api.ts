import type * as m from "./model"
import { dateToSql } from "./util"
import { dateParam } from "./date-param"
import type { Op as DrawerOp, Op } from "./drawer/op"
import type { ReceiptDrawerData } from "./drawer/ReceiptDrawerData"

export const backend: string = getBackend();
export const base: string = backend + "/api";
export const wsUrl: string =
  base.replace("/api", "/ws/events").replace(/^http?/, "ws");

function getBackend(): string {
  if (!import.meta.env.SSR) {
    const l = window.location;
    const proto = l.protocol.toLowerCase()
    console.log(proto);
    const port = proto === "https:" ? sslServerPort() : nonSslServerPort();
    console.log(port);
    return `${proto}//${l.hostname}:${port}`;
  } else {
    return "http://localhost:8080";
  }
}

function sslServerPort(): number {
  return 8443;
}

function nonSslServerPort(): number {
  return 8080;
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

  listWqueue(): Promise<m.Wqueue[]> {
    return get("list-wqueue", {});
  },

  async listWqueueFull(): Promise<Array<[m.Wqueue, m.Visit, m.Patient]>> {
    const [, wqList, vObj, pObj]:
      [number, Array<m.Wqueue>, object, object]
      = await get("list-wqueue-full", {});
    const vMap: Map<number, m.Visit> = new Map();
    Object.entries(vObj).forEach(([k, v]: [string, any]) => {
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

  findWqueue(visitId: number): Promise<m.Wqueue | null> {
    return get("find-wqueue", { "visit-id": visitId });
  },

  enterWqueue(wq: m.Wqueue): Promise<boolean> {
    return post("enter-wqueue", wq);
  },

  startVisit(patientId: number, at: string): Promise<m.Visit> {
    return get("start-visit", { "patient-id": patientId, "at": at });
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
      "patient-id": patientId, offset, count
    });
  },

  batchGetVisit(visitIds: number[]): Promise<Record<number, m.Visit>> {
    return post("batch-get-visit", visitIds);
  },

  batchGetVisitEx(visitIds: number[]): Promise<m.VisitEx[]> {
    return post("batch-get-visit-ex", visitIds);
  },

  getVisit(visitId: number): Promise<m.Visit> {
    return get("get-visit", { "visit-id": visitId });
  },

  async getVisitEx(visitId: number): Promise<m.VisitEx> {
    const visit = await get("get-visit-ex", { "visit-id": visitId });
    visit.shinryouList.sort((sa, sb) => {
      const a = sa.shinryoucode;
      const b = sb.shinryoucode;
      return a - b;
    });
    return visit;
  },

  async listVisitEx(patientId: number, offset: number, count: number): Promise<m.VisitEx[]> {
    const visitIds: number[] = await this.listVisitIdByPatientReverse(patientId, offset, count);
    const visits = await this.batchGetVisitEx(visitIds);
    visits.forEach(visit => {
      visit.shinryouList.sort((sa, sb) => {
        const a = sa.shinryoucode;
        const b = sb.shinryoucode;
        return a - b;
      })
    });
    return visits;
  },

  countVisitByPatient(patientId: number): Promise<number> {
    return get("count-visit-by-patient", { "patient-id": patientId });
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
    Promise<m.Shahokokuho | null> {
    return get("find-available-shahokokuho", {
      "patient-id": patientId, at: dateParam(at)
    })
  },

  findAvailableRoujin(patientId: number, at: Date | string):
    Promise<m.Roujin | null> {
    return get("find-available-roujin", {
      "patient-id": patientId,
      at: dateParam(at)
    })
  },

  findAvailableKoukikourei(patientId: number, at: Date | string):
    Promise<m.Koukikourei | null> {
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

  getShinryouEx(shinryouId: number): Promise<m.ShinryouEx> {
    return get("get-shinryou-ex", { "shinryou-id": shinryouId });
  },

  searchShinryouMaster(text: string, at: Date | string): Promise<m.ShinryouMaster[]> {
    return get("search-shinryou-master", { text, at: dateParam(at) });
  },

  deleteShinryou(shinryouId: number): Promise<boolean> {
    return get("delete-shinryou", { "shinryou-id": shinryouId });
  },

  searchIyakuhinMaster(text: string, at: Date | string): Promise<m.IyakuhinMaster[]> {
    return get("search-iyakuhin-master", { text, at: dateParam(at) });
  },

  searchKizaiMaster(text: string, at: Date | string): Promise<m.KizaiMaster[]> {
    return get("search-kizai-master", { text, at: dateParam(at) });
  },

  getConductEx(conductId: number): Promise<m.ConductEx> {
    return get("get-conduct-ex", { "conduct-id": conductId });
  },

  deleteConductEx(conductId: number): Promise<boolean> {
    return get("delete-conduct-ex", { "conduct-id": conductId });
  },

  enterConductShinryou(conductShinryou: m.ConductShinryou): Promise<m.ConductShinryou> {
    return post("enter-conduct-shinryou", conductShinryou);
  },

  enterConductDrug(conductDrug: m.ConductDrug): Promise<m.ConductDrug> {
    return post("enter-conduct-drug", conductDrug);
  },

  enterConductKizai(conductKizai: m.ConductKizai): Promise<m.ConductKizai> {
    return post("enter-conduct-kizai", conductKizai);
  },

  getConductShinryouEx(conductShinryouId: number): Promise<m.ConductShinryouEx> {
    return get("get-conduct-shinryou-ex", { "conduct-shinryou-id": conductShinryouId });
  },

  getConductDrugEx(conductDrugId: number): Promise<m.ConductDrugEx> {
    return get("get-conduct-drug-ex", { "conduct-drug-id": conductDrugId });
  },

  getConductKizaiEx(conductKizaiId: number): Promise<m.ConductKizaiEx> {
    return get("get-conduct-kizai-ex", { "conduct-kizai-id": conductKizaiId });
  },

  getConduct(conductId: number): Promise<m.Conduct> {
    return get("get-conduct", { "conduct-id": conductId });
  },

  deleteConductShinryou(conductShinryouId: number): Promise<boolean> {
    return get("delete-conduct-shinryou", { "conduct-shinryou-id": conductShinryouId });
  },

  deleteConductDrug(conductDrugId: number): Promise<boolean> {
    return get("delete-conduct-drug", { "conduct-drug-id": conductDrugId });
  },

  deleteConductKizai(conductKizaiId: number): Promise<boolean> {
    return get("delete-conduct-kizai", { "conduct-kizai-id": conductKizaiId });
  },

  updateConduct(conduct: m.Conduct): Promise<boolean> {
    return post("update-conduct", conduct)
  },

  setGazouLabel(gl: m.GazouLabel): Promise<boolean> {
    return post("set-gazou-label", gl);
  },

  finishCashier(payment: m.Payment): Promise<boolean> {
    return post("finish-cashier", payment);
  },

  updateChargeValue(visitId: number, chargeValue: number): Promise<m.Charge> {
    return get("update-charge-value", {
      "visit-id": visitId,
      "charge-value": chargeValue
    })
  },

  listCurrentDiseaseEx(patientId: number):
    Promise<[m.Disease, m.ByoumeiMaster, [m.DiseaseAdj, m.ShuushokugoMaster][]][]> {
    return get("list-current-disease-ex", { "patient-id": patientId });
  },

  listDiseaseEx(patientId: number):
    Promise<[m.Disease, m.ByoumeiMaster, [m.DiseaseAdj, m.ShuushokugoMaster][]][]> {
    return get("list-disease-ex", { "patient-id": patientId });
  },

  searchByoumeiMaster(text: string, at: Date | string): Promise<m.ByoumeiMaster[]> {
    return get("search-byoumei-master", {
      text,
      at: dateParam(at)
    });
  },

  searchShuushokugoMaster(text: string, at: Date | string): Promise<m.ShuushokugoMaster[]> {
    return get("search-shuushokugo-master", {
      text,
      at: dateParam(at)
    });
  },

  enterDiseaseEx(data: m.DiseaseEnterData): Promise<number> {
    return post("enter-disease-ex", data);
  },

  getDiseaseEx(diseaseId: number):
    Promise<[m.Disease, m.ByoumeiMaster, [m.DiseaseAdj, m.ShuushokugoMaster][]]> {
    return get("get-disease-ex", { "disease-id": diseaseId });
  },

  resolveByoumeiMasterByName(name: string, at: Date | string):
    Promise<m.ByoumeiMaster | null> {
    return get("resolve-byoumei-master-by-name", { name, at: dateParam(at) })
  },

  resolveShuushokugoMasterByName(name: string, at: Date | string):
    Promise<m.ShuushokugoMaster | null> {
    return get("resolve-shuushokugo-master-by-name", { name, at: dateParam(at) })
  },

  listDiseaseExample(): Promise<m.DiseaseExample[]> {
    return get("list-disease-example", {});
  },

  listVisitByPatientReverse(patientId: number, offset: number, count: number):
    Promise<m.Visit[]> {
    return get(
      "list-visit-by-patient-reverse",
      {"patient-id": patientId, "offset": offset, "count": count}
    );
  },

  endDisease(diseaseId: number, endDate: Date | string, endReason: string): Promise<boolean> {
    return get("end-disease", {
      "disease-id": diseaseId,
      "end-date": dateParam(endDate),
      "end-reason": endReason
    });
  },

  updateDiseaseEx(disease: m.Disease, shuushokugocodes: number[]): Promise<boolean> {
    return post("update-disease-ex", [disease, shuushokugocodes]);
  },

  listAppEventSince(fromEventId: number): Promise<m.AppEvent[]> {
    return get("list-app-event-since", { "from": fromEventId })
  },

  listTodaysHotline(): Promise<m.AppEvent[]> {
    return get("list-todays-hotline", {});
  },

  getNextAppEventId(): Promise<number> {
    return get("get-next-app-event-id", {});
  },

  postHotline(hotline: m.Hotline): Promise<boolean> {
    return post("post-hotline", hotline);
  },

}