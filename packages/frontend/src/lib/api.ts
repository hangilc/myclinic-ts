import * as m from "myclinic-model";
import { dateParam, dateTimeParam } from "./date-param";
import { type Op as DrawerOp, castOp as castDrawerOp } from "./drawer/op";
import type { ReceiptDrawerData } from "./drawer/receipt-drawer-data";
import { castBoolean, castCdr, castList, castNumber, castNumberFromString, castObject, castOption, castPair, castString, castStringToInt, castTuple3, castTuple4, type Caster } from "./cast";

const backend: string = getBackend();
const base: string = backend + "/api";
const wsUrl: string = base
  .replace("/api", "/ws/events")
  .replace(/^http?/, "ws");

export function getWsUrl(): string {
  return wsUrl;
}

export function getBase(): string {
  return base;
}

function getBackend(): string {
  if (!import.meta.env.SSR) {
    const l = window.location;
    let proto = l.protocol.toLowerCase();
    let host = l.hostname;
    let port = proto === "https:" ? sslServerPort() : nonSslServerPort();
    if (import.meta.env.VITE_BACKEND_PROTO) {
      proto = import.meta.env.VITE_BACKEND_PROTO;
    }
    if (import.meta.env.VITE_BACKEND_HOST) {
      host = import.meta.env.VITE_BACKEND_HOST;
    }
    if (import.meta.env.VITE_BACKEND_PORT) {
      port = import.meta.env.VITE_BACKEND_PORT;
    }
    return `${proto}//${host}:${port}`;
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

function identity<T>(arg: T): T {
  return arg;
}

type ParamsInit = string | string[][] | Record<string, string> | undefined;

async function get<T>(
  cmd: string,
  params: ParamsInit,
  cast: Caster<T>
): Promise<T> {
  let arg = `${base}/${cmd}`;
  if (typeof params === "object" && Object.keys(params).length !== 0) {
    const q = new URLSearchParams(params).toString();
    arg += `?${q}`;
  }
  const resp = await fetch(arg);
  return cast(await resp.json());
}

async function post<T>(
  cmd: string,
  data: any,
  params: ParamsInit,
  cast: Caster<T>
): Promise<T> {
  return postRaw(cmd, JSON.stringify(data), params, cast);
}

async function postRaw<T>(
  cmd: string,
  data: any,
  params: ParamsInit,
  cast: Caster<T>,
  init: object = {}
): Promise<T> {
  let arg = `${base}/${cmd}`;
  if (typeof params === "object" && Object.keys(params).length !== 0) {
    const q = new URLSearchParams(params).toString();
    arg += `?${q}`;
  }
  const resp = await fetch(arg, Object.assign({ method: "POST", body: data }, init));
  return cast(await resp.json());
}


export default {
  getPatient(patientId: number): Promise<m.Patient> {
    return get(
      "get-patient",
      { "patient-id": patientId.toString() },
      m.Patient.cast
    );
  },

  async searchPatient(text: string): Promise<Array<m.Patient>> {
    const [_, list] = await get(
      "search-patient",
      { text: text },
      castPair<any, m.Patient[]>(identity, castList(m.Patient.cast))
    );
    return list;
  },

  async searchPatientSmart(text: string): Promise<m.Patient[]> {
    text = text.trim();
    if (text) {
      if (/^\d+$/.test(text)) {
        const patientId = parseInt(text);
        return [await this.getPatient(patientId)];
      } else {
        return this.searchPatient(text);
      }
    } else {
      return [];
    }
  },

  batchGetPatient(patientIds: number[]): Promise<Record<number, m.Patient>> {
    return post<Record<number, m.Patient>>(
      "batch-get-patient",
      patientIds,
      {},
      castObject<number, m.Patient>(castNumberFromString, m.Patient.cast)
    );
  },

  listWqueue(): Promise<m.Wqueue[]> {
    return get<m.Wqueue[]>("list-wqueue", {}, castList(m.Wqueue.cast));
  },

  async listWqueueFull(): Promise<[m.Wqueue, m.Visit, m.Patient][]> {
    const [, wqList, vObj, pObj] = await get<
      [any, m.Wqueue[], Record<number, m.Visit>, Record<number, m.Patient>]
    >(
      "list-wqueue-full",
      {},
      castTuple4<
        any,
        m.Wqueue[],
        Record<number, m.Visit>,
        Record<number, m.Patient>
      >(
        identity,
        castList(m.Wqueue.cast),
        castObject<number, m.Visit>(castNumberFromString, m.Visit.cast),
        castObject<number, m.Patient>(castNumberFromString, m.Patient.cast)
      )
    );
    return wqList.map((wq) => {
      const visit = vObj[wq.visitId];
      const patient = pObj[visit.patientId];
      return [wq, visit, patient];
    });
  },

  changeWqueueState(visitId: number, wqueueState: number): Promise<m.Wqueue> {
    return get<m.Wqueue>(
      "change-wqueue-state",
      {
        "visit-id": visitId.toString(),
        "wqueue-state": wqueueState.toString(),
      },
      m.Wqueue.cast
    );
  },

  findWqueue(visitId: number): Promise<m.Wqueue | null> {
    return get(
      "find-wqueue",
      { "visit-id": visitId.toString() },
      castOption(m.Wqueue.cast)
    );
  },

  enterWqueue(wq: m.Wqueue): Promise<boolean> {
    return post("enter-wqueue", wq, {}, castBoolean);
  },

  updateWqueue(wq: m.Wqueue): Promise<boolean> {
    return post("update-wqueue", wq, {}, castBoolean);
  },

  startVisit(patientId: number, at: string | Date): Promise<m.Visit> {
    return get(
      "start-visit",
      {
        "patient-id": patientId.toString(),
        at: dateTimeParam(at),
      },
      m.Visit.cast
    );
  },

  startVisitWithHoken(patientId: number, at: string | Date, hoken: m.HokenIdSet): Promise<m.Visit> {
    return post(
      "start-visit-with-hoken",
      hoken,
      {
        "patient-id": patientId.toString(),
        at: dateTimeParam(at),
      },
      m.Visit.cast
    )
  },

  updateVisit(visit: m.Visit): Promise<boolean> {
    return post("update-visit", visit, {}, castBoolean);
  },

  listRecentVisit(offset: number, count: number): Promise<m.Visit[]> {
    return get(
      "list-recent-visit",
      { offset: offset.toString(), count: count.toString() },
      castList(m.Visit.cast)
    );
  },

  listRecentVisitFull(
    offset: number,
    count: number
  ): Promise<[m.Visit, m.Patient][]> {
    return get(
      "list-recent-visit-full",
      {
        offset: offset.toString(),
        count: count.toString(),
      },
      castList(castPair(m.Visit.cast, m.Patient.cast))
    );
  },

  listVisitByDate(date: string | Date): Promise<m.Visit[]> {
    return get(
      "list-visit-by-date",
      { at: dateParam(date) },
      castList(m.Visit.cast)
    );
  },

  listVisitIdByPatientReverse(
    patientId: number,
    offset: number,
    count: number
  ): Promise<number[]> {
    return get(
      "list-visit-id-by-patient-reverse",
      {
        "patient-id": patientId.toString(),
        offset: offset.toString(),
        count: count.toString(),
      },
      castList(castNumber)
    );
  },

  batchGetVisit(visitIds: number[]): Promise<Record<number, m.Visit>> {
    return post(
      "batch-get-visit",
      visitIds,
      {},
      castObject(castNumberFromString, m.Visit.cast)
    );
  },

  batchGetVisitEx(visitIds: number[]): Promise<m.VisitEx[]> {
    return post("batch-get-visit-ex", visitIds, {}, castList(m.VisitEx.cast));
  },

  getVisit(visitId: number): Promise<m.Visit> {
    return get("get-visit", { "visit-id": visitId.toString() }, m.Visit.cast);
  },

  async getVisitEx(visitId: number): Promise<m.VisitEx> {
    const visit: m.VisitEx = await get(
      "get-visit-ex",
      { "visit-id": visitId.toString() },
      m.VisitEx.cast
    );
    visit.shinryouList.sort((sa, sb) => {
      const a = sa.shinryoucode;
      const b = sb.shinryoucode;
      return a - b;
    });
    return visit;
  },

  async listVisitEx(
    patientId: number,
    offset: number,
    count: number
  ): Promise<m.VisitEx[]> {
    const visitIds: number[] = await this.listVisitIdByPatientReverse(
      patientId,
      offset,
      count
    );
    const visits: m.VisitEx[] = await this.batchGetVisitEx(visitIds);
    visits.forEach((visit) => {
      visit.shinryouList.sort((sa, sb) => {
        const a = sa.shinryoucode;
        const b = sb.shinryoucode;
        return a - b;
      });
    });
    return visits;
  },

  countVisitByPatient(patientId: number): Promise<number> {
    return get(
      "count-visit-by-patient",
      { "patient-id": patientId.toString() },
      castNumber
    );
  },

  deleteVisit(visitId: number): Promise<boolean> {
    return get("delete-visit", { "visit-id": visitId.toString() }, castBoolean);
  },

  deleteVisitFromReception(visitId: number): Promise<boolean> {
    return get(
      "delete-visit-from-reception",
      { "visit-id": visitId.toString() },
      castBoolean
    );
  },

  enterText(text: m.Text): Promise<m.Text> {
    return post("enter-text", text, {}, m.Text.cast);
  },

  updateText(text: m.Text): Promise<boolean> {
    return post("update-text", text, {}, castBoolean);
  },

  deleteText(textId: number): Promise<boolean> {
    return get("delete-text", { "text-id": textId.toString() }, castBoolean);
  },

  enterPayment(payment: m.Payment): Promise<boolean> {
    return post("enter-payment", payment, {}, castBoolean);
  },

  shohousenDrawer(textId: number): Promise<DrawerOp[]> {
    return get(
      "shohousen-drawer",
      { "text-id": textId.toString() },
      castList(castDrawerOp)
    );
  },

  shohousenDrawerText(text: string): Promise<DrawerOp[]> {
    return post("shohousen-drawer", text, {}, castList(castDrawerOp));
  },

  getMeisai(visitId: number): Promise<m.Meisai> {
    return get("get-meisai", { "visit-id": visitId.toString() }, m.Meisai.cast);
  },

  drawReceipt(data: ReceiptDrawerData): Promise<DrawerOp[]> {
    return post("draw-receipt", data, {}, castList(castDrawerOp));
  },

  createPdfFile(
    ops: DrawerOp[],
    paperSize: string,
    fileName: string
  ): Promise<boolean> {
    return post(
      "create-pdf-file",
      ops,
      {
        "paper-size": paperSize,
        "file-name": fileName,
      },
      castBoolean
    );
  },

  stampPdf(fileName: string, stamp: string): Promise<boolean> {
    return get(
      "stamp-pdf",
      { "file-name": fileName, stamp: stamp },
      castBoolean
    );
  },

  concatPdfFiles(files: string[], outFile: string): Promise<boolean> {
    return post(
      "concat-pdf-files",
      files,
      { "out-file": outFile },
      castBoolean
    );
  },

  deletePortalTmpFile(fileName: string): Promise<boolean> {
    return get(
      "delete-portal-tmp-file",
      { "file-name": fileName },
      castBoolean
    );
  },

  portalTmpFileUrl(fileName: string): string {
    return `${backend}/portal-tmp/${fileName}`;
  },

  findAvailableShahokokuho(
    patientId: number,
    at: Date | string
  ): Promise<m.Shahokokuho | null> {
    return get(
      "find-available-shahokokuho",
      {
        "patient-id": patientId.toString(),
        at: dateParam(at),
      },
      castOption(m.Shahokokuho.cast)
    );
  },

  findAvailableRoujin(
    patientId: number,
    at: Date | string
  ): Promise<m.Roujin | null> {
    return get(
      "find-available-roujin",
      {
        "patient-id": patientId.toString(),
        at: dateParam(at),
      },
      castOption(m.Roujin.cast)
    );
  },

  findAvailableKoukikourei(
    patientId: number,
    at: Date | string
  ): Promise<m.Koukikourei | null> {
    return get(
      "find-available-koukikourei",
      {
        "patient-id": patientId.toString(),
        at: dateParam(at),
      },
      castOption(m.Koukikourei.cast)
    );
  },

  listAvailableKouhi(patientId: number, at: Date | string): Promise<m.Kouhi[]> {
    return get(
      "list-available-kouhi",
      {
        "patient-id": patientId.toString(),
        at: dateParam(at),
      },
      castList(m.Kouhi.cast)
    );
  },

  updateHokenIds(visitId: number, hokenIdSet: m.HokenIdSet): Promise<boolean> {
    return post(
      "update-hoken-ids",
      hokenIdSet,
      {
        "visit-id": visitId.toString(),
      },
      castBoolean
    );
  },

  listAllHoken(
    patientId: number
  ): Promise<[m.Shahokokuho[], m.Koukikourei[], m.Roujin[], m.Kouhi[]]> {
    return get(
      "list-all-hoken",
      { "patient-id": patientId.toString() },
      castTuple4(
        castList(m.Shahokokuho.cast),
        castList(m.Koukikourei.cast),
        castList(m.Roujin.cast),
        castList(m.Kouhi.cast)
      )
    );
  },

  getShinryouRegular(): Promise<Record<string, string[]>> {
    return get(
      "get-shinryou-regular",
      {},
      castObject(castString, castList(castString))
    );
  },

  getShinryouKensa(): Promise<Record<string, string[]>> {
    return get(
      "get-shinryou-kensa",
      {},
      castObject(castString, castList(castString))
    );
  },

  resolveShinryoucode(
    shinryoucode: number,
    at: Date | string
  ): Promise<number | null> {
    return get(
      "resolve-shinryoucode",
      { shinryoucode: shinryoucode.toString(), at: dateParam(at) },
      castOption(castNumber)
    );
  },

  resolveShinryoucodeByName(
    name: string,
    at: Date | string
  ): Promise<number | null> {
    return get(
      "resolve-shinryoucode-by-name",
      {
        name: name,
        at: dateParam(at),
      },
      castOption(castNumber)
    );
  },

  resolveKizaicode(
    kizaicode: number,
    at: Date | string
  ): Promise<number | null> {
    return get(
      "resolve-kizaicode",
      { kizaicode: kizaicode.toString(), at: dateParam(at) },
      castOption(castNumber)
    );
  },

  // resolveIyakuhincode(
  //   iyakuhincode: number,
  //   at: Date | string
  // ): Promise<number | null> {
  //   return get(
  //     "resolve-iyakuhincode",
  //     { iyakuhincode: iyakuhincode.toString(), at: dateParam(at) },
  //     castOption(castNumber)
  //   );
  // },

  resolveKizaicodeByName(
    name: string,
    at: Date | string
  ): Promise<number | null> {
    return get(
      "resolve-kizaicode-by-name",
      {
        name: name,
        at: dateParam(at),
      },
      castOption(castNumber)
    );
  },

  batchEnterShinryou(
    visitId: number,
    shinryoucodes: number[]
  ): Promise<number[]> {
    return post(
      "batch-enter-shinryou",
      shinryoucodes,
      { "visit-id": visitId.toString() },
      castList(castNumber)
    );
  },

  batchEnterShinryouConduct(
    req: m.CreateShinryouConductRequest
  ): Promise<[number[], number[]]> {
    return post(
      "batch-enter-shinryou-conduct",
      req,
      {},
      castPair(castList(castNumber), castList(castNumber))
    );
  },

  getShinryouEx(shinryouId: number): Promise<m.ShinryouEx> {
    return get(
      "get-shinryou-ex",
      { "shinryou-id": shinryouId.toString() },
      m.ShinryouEx.cast
    );
  },

  searchShinryouMaster(
    text: string,
    at: Date | string
  ): Promise<m.ShinryouMaster[]> {
    return get(
      "search-shinryou-master",
      { text, at: dateParam(at) },
      castList(m.ShinryouMaster.cast)
    );
  },

  deleteShinryou(shinryouId: number): Promise<boolean> {
    return get(
      "delete-shinryou",
      { "shinryou-id": shinryouId.toString() },
      castBoolean
    );
  },

  searchIyakuhinMaster(
    text: string,
    at: Date | string
  ): Promise<m.IyakuhinMaster[]> {
    return get(
      "search-iyakuhin-master",
      { text, at: dateParam(at) },
      castList(m.IyakuhinMaster.cast)
    );
  },

  searchKizaiMaster(text: string, at: Date | string): Promise<m.KizaiMaster[]> {
    return get(
      "search-kizai-master",
      { text, at: dateParam(at) },
      castList(m.KizaiMaster.cast)
    );
  },

  getConductEx(conductId: number): Promise<m.ConductEx> {
    return get(
      "get-conduct-ex",
      { "conduct-id": conductId.toString() },
      m.ConductEx.cast
    );
  },

  deleteConductEx(conductId: number): Promise<boolean> {
    return get(
      "delete-conduct-ex",
      { "conduct-id": conductId.toString() },
      castBoolean
    );
  },

  enterConductShinryou(
    conductShinryou: m.ConductShinryou
  ): Promise<m.ConductShinryou> {
    return post(
      "enter-conduct-shinryou",
      conductShinryou,
      {},
      m.ConductShinryou.cast
    );
  },

  enterConductDrug(conductDrug: m.ConductDrug): Promise<m.ConductDrug> {
    return post("enter-conduct-drug", conductDrug, {}, m.ConductDrug.cast);
  },

  enterConductKizai(conductKizai: m.ConductKizai): Promise<m.ConductKizai> {
    return post("enter-conduct-kizai", conductKizai, {}, m.ConductKizai.cast);
  },

  getConductShinryouEx(
    conductShinryouId: number
  ): Promise<m.ConductShinryouEx> {
    return get(
      "get-conduct-shinryou-ex",
      {
        "conduct-shinryou-id": conductShinryouId.toString(),
      },
      m.ConductShinryouEx.cast
    );
  },

  getConductDrugEx(conductDrugId: number): Promise<m.ConductDrugEx> {
    return get(
      "get-conduct-drug-ex",
      { "conduct-drug-id": conductDrugId.toString() },
      m.ConductDrugEx.cast
    );
  },

  getConductKizaiEx(conductKizaiId: number): Promise<m.ConductKizaiEx> {
    return get(
      "get-conduct-kizai-ex",
      { "conduct-kizai-id": conductKizaiId.toString() },
      m.ConductKizaiEx.cast
    );
  },

  getConduct(conductId: number): Promise<m.Conduct> {
    return get(
      "get-conduct",
      { "conduct-id": conductId.toString() },
      m.Conduct.cast
    );
  },

  deleteConductShinryou(conductShinryouId: number): Promise<boolean> {
    return get(
      "delete-conduct-shinryou",
      {
        "conduct-shinryou-id": conductShinryouId.toString(),
      },
      castBoolean
    );
  },

  deleteConductDrug(conductDrugId: number): Promise<boolean> {
    return get(
      "delete-conduct-drug",
      { "conduct-drug-id": conductDrugId.toString() },
      castBoolean
    );
  },

  deleteConductKizai(conductKizaiId: number): Promise<boolean> {
    return get(
      "delete-conduct-kizai",
      { "conduct-kizai-id": conductKizaiId.toString() },
      castBoolean
    );
  },

  updateConduct(conduct: m.Conduct): Promise<boolean> {
    return post("update-conduct", conduct, {}, castBoolean);
  },

  setGazouLabel(gl: m.GazouLabel): Promise<boolean> {
    return post("set-gazou-label", gl, {}, castBoolean);
  },

  finishCashier(payment: m.Payment): Promise<boolean> {
    return post("finish-cashier", payment, {}, castBoolean);
  },

  updateChargeValue(visitId: number, chargeValue: number): Promise<m.Charge> {
    return get(
      "update-charge-value",
      {
        "visit-id": visitId.toString(),
        "charge-value": chargeValue.toString(),
      },
      m.Charge.cast
    );
  },

  listCurrentDiseaseEx(patientId: number): Promise<m.DiseaseData[]> {
    return get(
      "list-current-disease-ex",
      {
        "patient-id": patientId.toString(),
      },
      castList(m.DiseaseData.castFromTuple)
    );
  },

  listDiseaseEx(patientId: number): Promise<m.DiseaseData[]> {
    return get(
      "list-disease-ex",
      { "patient-id": patientId.toString() },
      castList(m.DiseaseData.castFromTuple)
    );
  },

  searchByoumeiMaster(
    text: string,
    at: Date | string
  ): Promise<m.ByoumeiMaster[]> {
    return get(
      "search-byoumei-master",
      {
        text,
        at: dateParam(at),
      },
      castList(m.ByoumeiMaster.cast)
    );
  },

  searchShuushokugoMaster(
    text: string,
    at: Date | string
  ): Promise<m.ShuushokugoMaster[]> {
    return get(
      "search-shuushokugo-master",
      {
        text,
        at: dateParam(at),
      },
      castList(m.ShuushokugoMaster.cast)
    );
  },

  enterDiseaseEx(data: m.DiseaseEnterData): Promise<number> {
    return post("enter-disease-ex", data, {}, castNumber);
  },

  deleteDiseaseEx(diseaseId: number): Promise<boolean> {
    return get("delete-disease-ex", { "disease-id": diseaseId.toString() }, castBoolean);
  },

  getDiseaseEx(diseaseId: number): Promise<m.DiseaseData> {
    return get(
      "get-disease-ex",
      { "disease-id": diseaseId.toString() },
      m.DiseaseData.castFromTuple
    );
  },

  resolveByoumeiMasterByName(
    name: string,
    at: Date | string
  ): Promise<m.ByoumeiMaster | null> {
    return get(
      "resolve-byoumei-master-by-name",
      { name, at: dateParam(at) },
      castOption(m.ByoumeiMaster.cast)
    );
  },

  resolveShuushokugoMasterByName(
    name: string,
    at: Date | string
  ): Promise<m.ShuushokugoMaster | null> {
    return get(
      "resolve-shuushokugo-master-by-name",
      {
        name,
        at: dateParam(at),
      },
      castOption(m.ShuushokugoMaster.cast)
    );
  },

  listDiseaseExample(): Promise<m.DiseaseExample[]> {
    return get("list-disease-example", {}, castList(m.DiseaseExample.cast));
  },

  listVisitByPatientReverse(
    patientId: number,
    offset: number,
    count: number
  ): Promise<m.Visit[]> {
    return get(
      "list-visit-by-patient-reverse",
      {
        "patient-id": patientId.toString(),
        offset: offset.toString(),
        count: count.toString(),
      },
      castList(m.Visit.cast)
    );
  },

  endDisease(
    diseaseId: number,
    endDate: Date | string,
    endReason: string
  ): Promise<boolean> {
    return get(
      "end-disease",
      {
        "disease-id": diseaseId.toString(),
        "end-date": dateParam(endDate),
        "end-reason": endReason,
      },
      castBoolean
    );
  },

  updateDiseaseEx(
    disease: m.Disease,
    shuushokugocodes: number[]
  ): Promise<boolean> {
    return post(
      "update-disease-ex",
      [disease, shuushokugocodes],
      {},
      castBoolean
    );
  },

  listAppEventSince(fromEventId: number): Promise<m.AppEvent[]> {
    return get(
      "list-app-event-since",
      { from: fromEventId.toString() },
      castList(m.AppEvent.cast)
    );
  },

  listTodaysHotline(): Promise<m.AppEvent[]> {
    return get("list-todays-hotline", {}, castList(m.AppEvent.cast));
  },

  getNextAppEventId(): Promise<number> {
    return get("get-next-app-event-id", {}, castNumber);
  },

  postHotline(hotline: m.Hotline): Promise<boolean> {
    return post("post-hotline", hotline, {}, castBoolean);
  },

  hotlineBeep(recipient: string): Promise<boolean> {
    return get("hotline-beep", { recipient }, castBoolean);
  },

  countSearchTextForPatient(text: string, patientId: number): Promise<number> {
    return get(
      "count-search-text-for-patient",
      {
        text,
        "patient-id": patientId.toString(),
      },
      castNumber
    );
  },

  searchTextForPatient(
    text: string,
    patientId: number,
    limit: number,
    offset: number
  ): Promise<[m.Text, m.Visit][]> {
    return get(
      "search-text-for-patient",
      {
        text,
        "patient-id": patientId.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
      },
      castList(castPair(m.Text.cast, m.Visit.cast))
    );
  },

  enterChargeValue(visitId: number, chargeValue: number): Promise<m.Charge> {
    return get(
      "enter-charge-value",
      {
        "visit-id": visitId.toString(),
        "charge-value": chargeValue.toString(),
      },
      m.Charge.cast
    );
  },

  getCharge(visitId: number): Promise<m.Charge> {
    return get("get-charge", { "visit-id": visitId.toString() }, m.Charge.cast);
  },

  uploadPatientImage(patientId: number, data: FormData): Promise<boolean> {
    return postRaw(
      "upload-patient-image",
      data,
      {
        "patient-id": patientId.toString(),
      },
      castBoolean
    );
  },

  listPatientImage(patientId: number): Promise<m.FileInfo[]> {
    return get(
      "list-patient-image",
      { "patient-id": patientId.toString() },
      castList(m.FileInfo.cast)
    );
  },

  patientImageUrl(patientId: number, filename: string): string {
    const fn = encodeURI(filename);
    return `${base}/patient-image?patient-id=${patientId}&file-name=${fn}`;
  },

  searchPrescExample(
    text: string
  ): Promise<[m.PrescExample, m.IyakuhinMaster][]> {
    return get(
      "search-presc-example-full",
      { text },
      castList(castPair(m.PrescExample.cast, m.IyakuhinMaster.cast))
    );
  },

  searchShohouSample(text: string): Promise<string[]> {
    return get("search-shohou-sample", { text }, castList(castString));
  },

  countSearchTextGlobally(text: string): Promise<number> {
    return get("count-search-text-globally", { text }, castNumber);
  },

  searchTextGlobally(
    text: string,
    limit: number,
    offset: number
  ): Promise<[m.Text, m.Visit, m.Patient][]> {
    return get(
      "search-text-globally",
      { text, limit: limit.toString(), offset: offset.toString() },
      castList(castTuple3(m.Text.cast, m.Visit.cast, m.Patient.cast))
    );
  },

  getWebphoneToken(): Promise<string> {
    return get("get-webphone-token", {}, castString);
  },

  getPatientHoken(
    patientId: number,
    at: string | Date
  ): Promise<[m.Shahokokuho[], m.Koukikourei[], m.Roujin[], m.Kouhi[]]> {
    return get<[m.Shahokokuho[], m.Koukikourei[], m.Roujin[], m.Kouhi[]]>(
      "get-patient-hoken",
      { "patient-id": patientId.toString(), at: dateParam(at) },
      (json: any) => {
        const [_ser, _patient, shahoList, koukiList, roujinList, kouhiList] =
          json;
        return [
          castList(m.Shahokokuho.cast)(shahoList),
          castList(m.Koukikourei.cast)(koukiList),
          castList(m.Roujin.cast)(roujinList),
          castList(m.Kouhi.cast)(kouhiList),
        ];
      }
    );
  },

  updatePatient(patient: m.Patient): Promise<boolean> {
    return post("update-patient", patient, {}, castBoolean);
  },

  enterPatient(patient: m.Patient): Promise<m.Patient> {
    return post("enter-patient", patient, {}, m.Patient.cast);
  },

  enterShahokokuho(shahokokuho: m.Shahokokuho): Promise<m.Shahokokuho> {
    return post("enter-shahokokuho", shahokokuho, {}, m.Shahokokuho.cast);
  },

  enterKoukikourei(koukikourei: m.Koukikourei): Promise<m.Koukikourei> {
    return post("enter-koukikourei", koukikourei, {}, m.Koukikourei.cast);
  },

  enterKouhi(kouhi: m.Kouhi): Promise<m.Kouhi> {
    return post("enter-kouhi", kouhi, {}, m.Kouhi.cast);
  },

  getShahokokuho(shahokokuhoId: number): Promise<m.Shahokokuho> {
    return get("get-shahokokuho", { "shahokoku-id": shahokokuhoId.toString() }, m.Shahokokuho.cast);
  },

  getKoukikourei(koukikoureiId: number): Promise<m.Koukikourei> {
    return get("get-koukikourei", { "shahokoku-id": koukikoureiId.toString() }, m.Koukikourei.cast);
  },

  getKouhi(kouhiId: number): Promise<m.Kouhi> {
    return get("get-kouhi", { "shahokoku-id": kouhiId.toString() }, m.Kouhi.cast);
  },

  updateShahokokuho(shahokokuho: m.Shahokokuho): Promise<number> {
    return post("update-shahokokuho", shahokokuho, {}, castNumber);
  },

  updateKoukikourei(koukikourei: m.Koukikourei): Promise<boolean> {
    return post("update-koukikourei", koukikourei, {}, castBoolean);
  },

  updateKouhi(kouhi: m.Kouhi): Promise<boolean> {
    return post("update-kouhi", kouhi, {}, castBoolean);
  },

  deleteShahokokuho(shahokokuhoId: number): Promise<boolean> {
    return get(
      "delete-shahokokuho",
      { "shahokokuho-id": shahokokuhoId.toString() },
      castBoolean
    );
  },

  deleteKoukikourei(koukikoureiId: number): Promise<boolean> {
    return get(
      "delete-koukikourei",
      { "koukikourei-id": koukikoureiId.toString() },
      castBoolean
    );
  },

  deleteKouhi(kouhiId: number): Promise<boolean> {
    return get("delete-kouhi", { "kouhi-id": kouhiId.toString() }, castBoolean);
  },

  batchCountHokenUsage(
    shahokokuhoIds: number[],
    koukikoureiIds: number[],
    roujinIds: number[],
    kouhiIds: number[]
  ): Promise<
    [
      Record<number, number>,
      Record<number, number>,
      Record<number, number>,
      Record<number, number>
    ]
  > {
    return post(
      "batch-count-hoken-usage",
      [shahokokuhoIds, koukikoureiIds, roujinIds, kouhiIds],
      {},
      castTuple4(
        castObject<number, number>(castStringToInt, castNumber),
        castObject<number, number>(castStringToInt, castNumber),
        castObject<number, number>(castStringToInt, castNumber),
        castObject<number, number>(castStringToInt, castNumber)
      )
    );
  },

  listMishuuForPatient(
    patientId: number,
    nVisits: number
  ): Promise<[m.Visit, m.Charge][]> {
    return get(
      "list-mishuu-for-patient",
      { "patient-id": patientId.toString(), "n-visits": nVisits.toString() },
      castList(castPair(m.Visit.cast, m.Charge.cast))
    );
  },

  savePatientImage(
    patientId: number,
    fileName: string,
    data: ArrayBuffer
  ): Promise<boolean> {
    return postRaw(
      "save-patient-image",
      data,
      { "patient-id": patientId.toString(), "file-name": fileName },
      castBoolean,
      {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": data.byteLength.toString(),
        }
      }
    );
  },

  renamePatientImage(
    patientId: number,
    src: string,
    dst: string
  ): Promise<boolean> {
    return get(
      "rename-patient-image",
      { "patient-id": patientId.toString(), src, dst },
      castBoolean
    );
  },

  deletePatientImage(patientId: number, fileName: string): Promise<boolean> {
    return get(
      "delete-patient-image",
      { "patient-id": patientId.toString(), "file-name": fileName },
      castBoolean
    );
  },

  batchResolveClinicOperations(
    dates: Date[]
  ): Promise<Record<string, m.ClinicOperation>> {
    return post(
      "batch-resolve-clinic-operations",
      dates.map((d) => dateParam(d)),
      {},
      castObject(castString, m.ClinicOperation.cast)
    );
  },

  listAppoints(date: Date | string): Promise<[m.AppointTime, m.Appoint[]][]> {
    return get(
      "list-appoint-time-filled",
      { date: dateParam(date) },
      castCdr(castList(castPair(m.AppointTime.cast, castList(m.Appoint.cast))))
    );
  },

  fillAppointTimes(from: Date | string, upto: Date | string): Promise<boolean> {
    return get(
      "fill-appoint-times",
      { from: dateParam(from), upto: dateParam(upto) },
      castBoolean
    );
  },

  registerAppoint(appoint: m.Appoint): Promise<m.Appoint> {
    return post("register-appoint", appoint, {}, m.Appoint.cast);
  },

  updateAppoint(appoint: m.Appoint): Promise<boolean> {
    return post("update-appoint", appoint, {}, castBoolean);
  },

  cancelAppoint(appointId: number): Promise<boolean> {
    return post(
      "cancel-appoint",
      {},
      { "appoint-id": appointId.toString() },
      castBoolean
    );
  },

  getAppointTime(appointTimeId: number): Promise<m.AppointTime> {
    return get("get-appoint-time", { "appoint-time-id": appointTimeId.toString() },
      m.AppointTime.cast);
  },

  updateAppointTime(appointTime: m.AppointTime): Promise<boolean> {
    return post("update-appoint-time", appointTime, {}, castBoolean);
  },

  deleteAppointTime(appointTimeId: number): Promise<boolean> {
    return post(
      "delete-appoint-time",
      {},
      { "appoint-time-id": appointTimeId.toString() },
      castBoolean
    );
  },

  addAppointTime(appointTime: m.AppointTime): Promise<boolean> {
    return post("add-appoint-time", appointTime, {}, castBoolean);
  },

  searchAppointByPatientId(
    patientId: number
  ): Promise<[m.Appoint, m.AppointTime][]> {
    return get(
      "search-appoint-by-patient-id",
      { "patient-id": patientId.toString() },
      castList(castPair(m.Appoint.cast, m.AppointTime.cast))
    );
  },

  searchAppointByPatientName(
    text: string
  ): Promise<[m.Appoint, m.AppointTime][]> {
    return get(
      "search-appoint-by-patient-name",
      { text },
      castList(castPair(m.Appoint.cast, m.AppointTime.cast))
    );
  },

  searchAppointByPatientName2(
    text1: string,
    text2: string
  ): Promise<[m.Appoint, m.AppointTime][]> {
    return get(
      "search-appoint-by-patient-name2",
      { text1, text2 },
      castList(castPair(m.Appoint.cast, m.AppointTime.cast))
    );
  },

  listAppointEvents(limit: number, offset: number): Promise<m.AppEvent[]> {
    return get(
      "list-appoint-events",
      {
        limit: limit.toString(),
        offset: offset.toString(),
      },
      castList(m.AppEvent.cast)
    );
  },

  getOnshi(visitId: number): Promise<m.Onshi> {
    return get("get-onshi", { "visit-id": visitId.toString() }, m.Onshi.cast);
  },

  async findOnshi(visitId: number): Promise<m.Onshi | undefined> {
    const o = await get("find-onshi", { "visit-id": visitId.toString() }, castOption(m.Onshi.cast))
    return o || undefined;
  },

  setOnshi(onshi: m.Onshi): Promise<boolean> {
    return post("set-onshi", onshi, {}, castBoolean);
  },

  clearOnshi(visitId: number): Promise<boolean> {
    return get("clear-onshi", { "visit-id": visitId.toString() }, castBoolean);
  },

  batchProbeOnshi(visitIds: number[]): Promise<number[]> {
    return post("batch-probe-onshi", visitIds, {}, castList(castNumber));
  },

  dictGet(key: string): Promise<string> {
    return get("dict-get", { key }, castString);
  },

  dictSet(key: string, value: string): Promise<boolean> {
    return get("dict-set", { key, value }, castBoolean);
  },

  newShahokokuho(shahokokuho: m.Shahokokuho): Promise<m.Shahokokuho> {
    return post("new-shahokokuho", shahokokuho, {}, m.Shahokokuho.cast)
  },

  newKoukikourei(koukikourei: m.Koukikourei): Promise<m.Koukikourei> {
    return post("new-koukikourei", koukikourei, {}, m.Koukikourei.cast)
  },

  shahokokuhoUsageSince(shahokokuhoId: number, since: Date | string): Promise<m.Visit[]> {
    return get("shahokokuho-usage-since", {
      "shahokokuho-id": shahokokuhoId.toString(),
      date: dateParam(since),
    }, castList(m.Visit.cast));
  },

  shahokokuhoUsage(shahokokuhoId: number): Promise<m.Visit[]> {
    return get("shahokokuho-usage", {
      "shahokokuho-id": shahokokuhoId.toString(),
    }, castList(m.Visit.cast));
  },

  koukikoureiUsageSince(koukikoureiId: number, since: Date | string): Promise<m.Visit[]> {
    return get("koukikourei-usage-since", {
      "koukikourei-id": koukikoureiId.toString(),
      date: dateParam(since),
    }, castList(m.Visit.cast));
  },

  koukikoureiUsage(koukikoureiId: number): Promise<m.Visit[]> {
    return get("koukikourei-usage", {
      "koukikourei-id": koukikoureiId.toString(),
    }, castList(m.Visit.cast));
  },

  kouhiUsageSince(kouhiId: number, since: Date | string): Promise<m.Visit[]> {
    return get("kouhi-usage-since", {
      "kouhi-id": kouhiId.toString(),
      date: dateParam(since),
    }, castList(m.Visit.cast));
  },

  kouhiUsage(kouhiId: number): Promise<m.Visit[]> {
    return get("kouhi-usage", {
      "kouhi-id": kouhiId.toString(),
    }, castList(m.Visit.cast));
  },

  listConductForVisit(visitId: number): Promise<m.Conduct[]> {
    return get("list-conduct-for-visit", {
      "visit-id": visitId.toString()
    },
      castList(m.Conduct.cast));
  },

  listVisitIdByPatientAndMonth(patientId: number, year: number, month: number): Promise<number[]> {
    return get("list-visit-id-by-patient-and-month", {
      "patient-id": patientId.toString(),
      year: year.toString(),
      month: month.toString(),
    }, castList(castNumber));
  },

  batchEnterOrUpdateHoken(shahokokuhoList: m.Shahokokuho[], koukikoureiList: m.Koukikourei[]):
    Promise<[m.Shahokokuho[], m.Koukikourei[]]> {
    return post("batch-enter-or-update-hoken", {
      shahokokuhoList, koukikoureiList
    }, {}, castPair(castList(m.Shahokokuho.cast), castList(m.Koukikourei.cast)))
  },

  countShahokokuhoUsage(shahokokuhoId: number): Promise<number> {
    return get("count-shahokokuho-usage", { "shahokokuho-id": shahokokuhoId.toString() }, castNumber);
  },

  countShahokokuhoUsageBefore(shahokokuhoId: number, date: string | Date): Promise<number> {
    return get("count-shahokokuho-usage-before", {
      "shahokokuho-id": shahokokuhoId.toString(),
      date: dateParam(date)
    }, castNumber);
  },

  countShahokokuhoUsageAfter(shahokokuhoId: number, date: string | Date): Promise<number> {
    return get("count-shahokokuho-usage-after", {
      "shahokokuho-id": shahokokuhoId.toString(),
      date: dateParam(date)
    }, castNumber);
  },

  countKoukikoureiUsage(koukikoureiId: number): Promise<number> {
    return get("count-koukikourei-usage", { "koukikourei-id": koukikoureiId.toString() }, castNumber);
  },

  countKoukikoureiUsageBefore(koukikoureiId: number, date: string | Date): Promise<number> {
    return get("count-koukikourei-usage-before", {
      "koukikourei-id": koukikoureiId.toString(),
      date: dateParam(date)
    }, castNumber);
  },

  countKoukikoureiUsageAfter(koukikoureiId: number, date: string | Date): Promise<number> {
    return get("count-koukikourei-usage-after", {
      "koukikourei-id": koukikoureiId.toString(),
      date: dateParam(date)
    }, castNumber);
  },

  countKouhiUsage(kouhiId: number): Promise<number> {
    return get("count-kouhi-usage", { "kouhi-id": kouhiId.toString() }, castNumber);
  },

  countKouhiUsageBefore(kouhiId: number, date: string | Date): Promise<number> {
    return get("count-kouhi-usage-before", {
      "kouhi-id": kouhiId.toString(),
      date: dateParam(date)
    }, castNumber);
  },

  countKouhiUsageAfter(kouhiId: number, date: string | Date): Promise<number> {
    return get("count-kouhi-usage-after", {
      "kouhi-id": kouhiId.toString(),
      date: dateParam(date)
    }, castNumber);
  },

  getClinicInfo(): Promise<m.ClinicInfo> {
    return get("get-clinic-info", {}, m.ClinicInfo.cast);
  },

  batchGetChargePayment(visitIds: number[]): Promise<[number, m.Charge | null, m.Payment | null][]> {
    return post("batch-get-charge-payment", visitIds, {},
      castList(castTuple3(castNumber, castOption(m.Charge.cast), castOption(m.Payment.cast))));
  },

};
