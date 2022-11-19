import * as m from "myclinic-model";
import { dateToSql } from "./util";
import { dateParam, dateTimeParam } from "./date-param";
import type { Op as DrawerOp, Op } from "./drawer/op";
import type { ReceiptDrawerData } from "./drawer/receipt-drawer-data";

export const backend: string = getBackend();
export const base: string = backend + "/api";
export const wsUrl: string = base
  .replace("/api", "/ws/events")
  .replace(/^http?/, "ws");

function getBackend(): string {
  if (!import.meta.env.SSR) {
    const l = window.location;
    const proto = l.protocol.toLowerCase();
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

function identity<T>(arg: T): T {
  return arg;
}

type Caster<T> = (arg: any) => T;

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
  cast: Caster<T>
): Promise<T> {
  let arg = `${base}/${cmd}`;
  if (typeof params === "object" && Object.keys(params).length !== 0) {
    const q = new URLSearchParams(params).toString();
    arg += `?${q}`;
  }
  const resp = await fetch(arg, { method: "POST", body: data });
  return cast(await resp.json());
}

function castNumber(arg: any): number {
  if (typeof arg === "number") {
    return arg;
  } else {
    throw new Error("Cannot cast to number: " + arg);
  }
}

function castString(arg: any): string {
  if (typeof arg === "string") {
    return arg;
  } else {
    throw new Error("Cannot cast to string: " + arg);
  }
}

function castBoolean(arg: any): boolean {
  if (typeof arg === "boolean") {
    return arg;
  } else {
    throw new Error("Cannot cast to boolean: " + arg);
  }
}

function castPair<T, U>(
  castT: Caster<T>,
  castU: Caster<U>
): (arg: any) => [T, U] {
  return (arg: any) => [castT(arg[0]), castU(arg[1])];
}

function castTuple3<A, B, C>(
  castA: Caster<A>,
  castB: Caster<B>,
  castC: Caster<C>
): (arg: any) => [A, B, C] {
  return (arg: any) => [castA(arg[0]), castB(arg[1]), castC(arg[2])];
}

function castTuple4<A, B, C, D>(
  castA: Caster<A>,
  castB: Caster<B>,
  castC: Caster<C>,
  castD: Caster<D>
): (arg: any) => [A, B, C, D] {
  return (arg: any) => [
    castA(arg[0]),
    castB(arg[1]),
    castC(arg[2]),
    castD(arg[3]),
  ];
}

function castList<T>(cast: Caster<T>): Caster<T[]> {
  return (arg: any) => arg.map((a: any) => cast(a));
}

type ObjectKey = string | number | symbol;

function castObject<K extends ObjectKey, V>(
  castKey: Caster<K>,
  castValue: Caster<V>
): (arg: any) => Record<K, V> {
  return (arg: any) => {
    const obj = {} as Record<K, V>;
    for (let k in arg) {
      const key = castKey(k);
      const val = castValue(arg[k]);
      obj[key] = val;
    }
    return obj;
  };
}

function castOption<T>(cast: Caster<T>): Caster<T | null> {
  return (arg: any) => {
    if (arg == null) {
      return null;
    } else {
      return cast(arg);
    }
  };
}

export default {
  getPatient(patientId: number): Promise<m.Patient> {
    return get("get-patient", { "patient-id": patientId.toString() }, m.Patient.cast);
  },

  async searchPatient(text: string): Promise<Array<m.Patient>> {
    const [_, list] = await get(
      "search-patient",
      { text: text },
      castPair<any, m.Patient[]>(identity, castList(m.Patient.cast))
    );
    return list;
  },

  batchGetPatient(patientIds: number[]): Promise<Record<number, m.Patient>> {
    return post<Record<number, m.Patient>>(
      "batch-get-patient",
      patientIds,
      {},
      castObject<number, m.Patient>(castNumber, m.Patient.cast)
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
        castObject<number, m.Visit>(castNumber, m.Visit.cast),
        castObject<number, m.Patient>(castNumber, m.Patient.cast)
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

  startVisit(patientId: number, at: string | Date): Promise<m.Visit> {
    return get("start-visit", {
      "patient-id": patientId,
      at: dateTimeParam(at),
    });
  },

  updateVisit(visit: m.Visit): Promise<boolean> {
    return post("update-visit", visit);
  },

  listRecentVisit(offset: number, count: number): Promise<Array<m.Visit>> {
    return get("list-recent-visit", { offset, count });
  },

  listRecentVisitFull(
    offset: number,
    count: number
  ): Promise<Array<[m.Visit, m.Patient]>> {
    return get("list-recent-visit-full", { offset, count });
  },

  listVisitByDate(date: Date): Promise<m.Visit[]> {
    const at = dateToSql(date);
    return get("list-visit-by-date", { at });
  },

  listVisitIdByPatientReverse(
    patientId: number,
    offset: number,
    count: number
  ): Promise<number[]> {
    return get("list-visit-id-by-patient-reverse", {
      "patient-id": patientId,
      offset,
      count,
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
    const visit: m.VisitEx = await get("get-visit-ex", { "visit-id": visitId });
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

  async getMeisai(visitId: number): Promise<m.Meisai> {
    return m.Meisai.cast(await get("get-meisai", { "visit-id": visitId }));
  },

  drawReceipt(data: ReceiptDrawerData): Promise<Op[]> {
    return post("draw-receipt", data);
  },

  createPdfFile(
    ops: Op[],
    paperSize: string,
    fileName: string
  ): Promise<boolean> {
    return post("create-pdf-file", ops, {
      "paper-size": paperSize,
      "file-name": fileName,
    });
  },

  stampPdf(fileName: string, stamp: string): Promise<boolean> {
    return get("stamp-pdf", { "file-name": fileName, stamp: stamp });
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

  findAvailableShahokokuho(
    patientId: number,
    at: Date | string
  ): Promise<m.Shahokokuho | null> {
    return get("find-available-shahokokuho", {
      "patient-id": patientId,
      at: dateParam(at),
    });
  },

  findAvailableRoujin(
    patientId: number,
    at: Date | string
  ): Promise<m.Roujin | null> {
    return get("find-available-roujin", {
      "patient-id": patientId,
      at: dateParam(at),
    });
  },

  findAvailableKoukikourei(
    patientId: number,
    at: Date | string
  ): Promise<m.Koukikourei | null> {
    return get("find-available-koukikourei", {
      "patient-id": patientId,
      at: dateParam(at),
    });
  },

  listAvailableKouhi(patientId: number, at: Date | string): Promise<m.Kouhi[]> {
    return get("list-available-kouhi", {
      "patient-id": patientId,
      at: dateParam(at),
    });
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

  resolveShinryoucodeByName(
    name: string,
    at: Date | string
  ): Promise<number | null> {
    return get("resolve-shinryoucode-by-name", {
      name: name,
      at: dateParam(at),
    });
  },

  resolveKizaicodeByName(
    name: string,
    at: Date | string
  ): Promise<number | null> {
    return get("resolve-kizaicode-by-name", {
      name: name,
      at: dateParam(at),
    });
  },

  batchEnterShinryouConduct(
    req: m.CreateShinryouConductRequest
  ): Promise<[number[], number[]]> {
    return post("batch-enter-shinryou-conduct", req);
  },

  getShinryouEx(shinryouId: number): Promise<m.ShinryouEx> {
    return get("get-shinryou-ex", { "shinryou-id": shinryouId });
  },

  searchShinryouMaster(
    text: string,
    at: Date | string
  ): Promise<m.ShinryouMaster[]> {
    return get("search-shinryou-master", { text, at: dateParam(at) });
  },

  deleteShinryou(shinryouId: number): Promise<boolean> {
    return get("delete-shinryou", { "shinryou-id": shinryouId });
  },

  searchIyakuhinMaster(
    text: string,
    at: Date | string
  ): Promise<m.IyakuhinMaster[]> {
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

  enterConductShinryou(
    conductShinryou: m.ConductShinryou
  ): Promise<m.ConductShinryou> {
    return post("enter-conduct-shinryou", conductShinryou);
  },

  enterConductDrug(conductDrug: m.ConductDrug): Promise<m.ConductDrug> {
    return post("enter-conduct-drug", conductDrug);
  },

  enterConductKizai(conductKizai: m.ConductKizai): Promise<m.ConductKizai> {
    return post("enter-conduct-kizai", conductKizai);
  },

  getConductShinryouEx(
    conductShinryouId: number
  ): Promise<m.ConductShinryouEx> {
    return get("get-conduct-shinryou-ex", {
      "conduct-shinryou-id": conductShinryouId,
    });
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
    return get("delete-conduct-shinryou", {
      "conduct-shinryou-id": conductShinryouId,
    });
  },

  deleteConductDrug(conductDrugId: number): Promise<boolean> {
    return get("delete-conduct-drug", { "conduct-drug-id": conductDrugId });
  },

  deleteConductKizai(conductKizaiId: number): Promise<boolean> {
    return get("delete-conduct-kizai", { "conduct-kizai-id": conductKizaiId });
  },

  updateConduct(conduct: m.Conduct): Promise<boolean> {
    return post("update-conduct", conduct);
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
      "charge-value": chargeValue,
    });
  },

  listCurrentDiseaseEx(
    patientId: number
  ): Promise<
    [m.Disease, m.ByoumeiMaster, [m.DiseaseAdj, m.ShuushokugoMaster][]][]
  > {
    return get("list-current-disease-ex", { "patient-id": patientId });
  },

  listDiseaseEx(
    patientId: number
  ): Promise<
    [m.Disease, m.ByoumeiMaster, [m.DiseaseAdj, m.ShuushokugoMaster][]][]
  > {
    return get("list-disease-ex", { "patient-id": patientId });
  },

  searchByoumeiMaster(
    text: string,
    at: Date | string
  ): Promise<m.ByoumeiMaster[]> {
    return get("search-byoumei-master", {
      text,
      at: dateParam(at),
    });
  },

  searchShuushokugoMaster(
    text: string,
    at: Date | string
  ): Promise<m.ShuushokugoMaster[]> {
    return get("search-shuushokugo-master", {
      text,
      at: dateParam(at),
    });
  },

  enterDiseaseEx(data: m.DiseaseEnterData): Promise<number> {
    return post("enter-disease-ex", data);
  },

  getDiseaseEx(
    diseaseId: number
  ): Promise<
    [m.Disease, m.ByoumeiMaster, [m.DiseaseAdj, m.ShuushokugoMaster][]]
  > {
    return get("get-disease-ex", { "disease-id": diseaseId });
  },

  resolveByoumeiMasterByName(
    name: string,
    at: Date | string
  ): Promise<m.ByoumeiMaster | null> {
    return get("resolve-byoumei-master-by-name", { name, at: dateParam(at) });
  },

  resolveShuushokugoMasterByName(
    name: string,
    at: Date | string
  ): Promise<m.ShuushokugoMaster | null> {
    return get("resolve-shuushokugo-master-by-name", {
      name,
      at: dateParam(at),
    });
  },

  listDiseaseExample(): Promise<m.DiseaseExample[]> {
    return get("list-disease-example", {});
  },

  listVisitByPatientReverse(
    patientId: number,
    offset: number,
    count: number
  ): Promise<m.Visit[]> {
    return get("list-visit-by-patient-reverse", {
      "patient-id": patientId,
      offset: offset,
      count: count,
    });
  },

  endDisease(
    diseaseId: number,
    endDate: Date | string,
    endReason: string
  ): Promise<boolean> {
    return get("end-disease", {
      "disease-id": diseaseId,
      "end-date": dateParam(endDate),
      "end-reason": endReason,
    });
  },

  updateDiseaseEx(
    disease: m.Disease,
    shuushokugocodes: number[]
  ): Promise<boolean> {
    return post("update-disease-ex", [disease, shuushokugocodes]);
  },

  listAppEventSince(fromEventId: number): Promise<m.AppEvent[]> {
    return get("list-app-event-since", { from: fromEventId });
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

  countSearchTextForPatient(text: string, patientId: number): Promise<number> {
    return get("count-search-text-for-patient", {
      text,
      "patient-id": patientId,
    });
  },

  searchTextForPatient(
    text: string,
    patientId: number,
    limit: number,
    offset: number
  ): Promise<[m.Text, m.Visit][]> {
    return get("search-text-for-patient", {
      text,
      "patient-id": patientId,
      limit,
      offset,
    });
  },

  enterChargeValue(visitId: number, chargeValue: number): Promise<m.Charge> {
    return get("enter-charge-value", {
      "visit-id": visitId,
      "charge-value": chargeValue,
    });
  },

  uploadPatientImage(patientId: number, data: FormData): Promise<boolean> {
    return postRaw("upload-patient-image", data, { "patient-id": patientId });
  },

  listPatientImage(patientId: number): Promise<m.FileInfo[]> {
    return get("list-patient-image", { "patient-id": patientId });
  },

  patientImageUrl(patientId: number, filename: string): string {
    const fn = encodeURI(filename);
    return `${base}/patient-image?patient-id=${patientId}&file-name=${fn}`;
  },

  searchPrescExample(
    text: string
  ): Promise<[m.PrescExample, m.IyakuhinMaster][]> {
    return get("search-presc-example-full", { text });
  },

  searchShohouSample(text: string): Promise<string[]> {
    return get("search-shohou-sample", { text });
  },

  countSearchTextGlobally(text: string): Promise<number> {
    return get("count-search-text-globally", { text });
  },

  searchTextGlobally(
    text: string,
    limit: number,
    offset: number
  ): Promise<[m.Text, m.Visit, m.Patient][]> {
    return get("search-text-globally", { text, limit, offset });
  },
};
