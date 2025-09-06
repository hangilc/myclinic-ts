import { toKouhi, interfaceToKouhi } from "myclinic-model";
import * as m from "myclinic-model";
import { dateParam, dateTimeParam } from "./date-param";
import { type Op as DrawerOp, type Op } from "./drawer/compiler/op";
import {
  castBoolean,
  castCdr,
  castList,
  castListOpt,
  castNumber,
  castNumberFromString,
  castObject,
  castOption,
  castPair,
  castString,
  castStringToInt,
  castTuple3,
  castTuple4,
  type Caster,
} from "./cast";
import { pipe } from "myclinic-model/pipe";
import type { RP剤情報, 用法レコード } from "./denshi-shohou/presc-info";
import type { FreqUsage } from "./cache";
import type { DrugDisease } from "./drug-disease";
import {
  validateShinryouDisease,
  type ShinryouDisease,
} from "./shinryou-disease";
import { parseLocationQuery } from "./parse-location-query";
import { validateDupPatient, type DupPatient } from "@/practice/dup-patient/dup-patient";
import { convertToHankakuIfDigits } from "./zenkaku";
import type { DrugNameBind } from "./drug-name-bind";

function castDrawerOp(obj: any): DrawerOp {
  return obj;
}

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

export function getBackend(): string {
  if (!import.meta.env.SSR) {
    const l = window.location;
    let proto = l.protocol.toLowerCase();
    let host = l.hostname;
    // let port = proto === "https:" ? sslServerPort() : nonSslServerPort();
    let port = proto === "https:" ? l.port : nonSslServerPort();
    if (import.meta.env.VITE_BACKEND_PROTO) {
      proto = import.meta.env.VITE_BACKEND_PROTO;
    }
    if (import.meta.env.VITE_BACKEND_HOST) {
      host = import.meta.env.VITE_BACKEND_HOST;
    }
    if (import.meta.env.VITE_BACKEND_PORT) {
      port = import.meta.env.VITE_BACKEND_PORT;
    }
    let query = parseLocationQuery();
    if (query["api-port"]) {
      // port = parseInt(query["api-port"])
      port = query["api-port"];
    }
    let result = `${proto}//${host}:${port}`;
    console.log("getBackend", result);
    return result;
  } else {
    return "http://localhost:8080";
  }
}

// function sslServerPort(): number {
//   return 8443;
// }

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

async function getText(cmd: string, params: ParamsInit): Promise<string> {
  let arg = `${base}/${cmd}`;
  if (typeof params === "object" && Object.keys(params).length !== 0) {
    const q = new URLSearchParams(params).toString();
    arg += `?${q}`;
  }
  const resp = await fetch(arg);
  return await resp.text();
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
  const resp = await fetch(
    arg,
    Object.assign({ method: "POST", body: data }, init)
  );
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
    text = convertToHankakuIfDigits(text);
    const [_, list] = await get(
      "search-patient",
      { text: text },
      castPair<any, m.Patient[]>(identity, castList(m.Patient.cast))
    );
    return list;
  },

  async searchPatientSmart(text: string): Promise<m.Patient[]> {
    text = text.trim();
    text = convertToHankakuIfDigits(text);
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

  async seawrchPatientByPhone(text: string): Promise<m.Patient[]> {
    return await get(
      "search-patient-by-phone",
      { text },
      castList(m.Patient.cast)
    );
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

  startVisitWithHoken(
    patientId: number,
    at: string | Date,
    hoken: m.HokenIdSet
  ): Promise<m.Visit> {
    return post(
      "start-visit-with-hoken",
      hoken,
      {
        "patient-id": patientId.toString(),
        at: dateTimeParam(at),
      },
      m.Visit.cast
    );
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

  getText(textId: number): Promise<m.Text> {
    return get("get-text", { "text-id": textId.toString() }, m.Text.cast);
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

  listTextForVisit(visitId: number): Promise<m.Text[]> {
    return get(
      "list-text-for-visit",
      { "visit-id": visitId.toString() },
      castList(m.Text.cast)
    );
  },

  enterPayment(payment: m.Payment): Promise<boolean> {
    return post("enter-payment", payment, {}, castBoolean);
  },

  listPayment(visitId: number): Promise<m.Payment[]> {
    return get(
      "list-payment",
      { "visit-id": visitId.toString() },
      castList(m.Payment.cast)
    );
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

  // getMeisai(visitId: number): Promise<m.Meisai> {
  //   return get("get-meisai", { "visit-id": visitId.toString() }, m.Meisai.cast);
  // },

  // drawReceipt(data: ReceiptDrawerData): Promise<DrawerOp[]> {
  //   return post("draw-receipt", data, {}, castList(castDrawerOp));
  // },

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

  listAvailableShahokokuho(
    patientId: number,
    at: Date | string
  ): Promise<m.Shahokokuho[]> {
    return get(
      "list-available-shahokokuho",
      {
        "patient-id": patientId.toString(),
        at: dateParam(at),
      },
      castList(m.Shahokokuho.cast)
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

  listAvailableKoukikourei(
    patientId: number,
    at: Date | string
  ): Promise<m.Koukikourei[]> {
    return get(
      "list-available-koukikourei",
      {
        "patient-id": patientId.toString(),
        at: dateParam(at),
      },
      castList(m.Koukikourei.cast)
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
      castList(pipe(toKouhi, interfaceToKouhi))
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
        castList(pipe(toKouhi, interfaceToKouhi))
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

  updateShinryou(shinryou: m.Shinryou): Promise<m.Shinryou> {
    return post("update-shinryou", shinryou, {}, m.Shinryou.cast);
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

  findIyakuhinMasterByName(
    name: string,
    at: Date | string
  ): Promise<m.IyakuhinMaster | null> {
    return get(
      "find-iyakuhin-master-by-name",
      { name, at: dateParam(at) },
      castOption(m.IyakuhinMaster.cast)
    )
  },

  listIyakuhinMasterByIppanmei(
    ippanmei: string,
    at: Date | string
  ): Promise<m.IyakuhinMaster[]> {
    return get(
      "list-iyakuhin-master-by-ippanmei",
      { ippanmei, at: dateParam(at) },
      castList(m.IyakuhinMaster.cast)
    );
  },

  listIyakuhinMasterByIppanmeicode(
    ippanmeicode: string,
    at: Date | string
  ): Promise<m.IyakuhinMaster[]> {
    return get(
      "list-iyakuhin-master-by-ippanmeicode",
      { ippanmeicode, at: dateParam(at) },
      castList(m.IyakuhinMaster.cast)
    );
  },

  getIyakuhinMaster(
    iyakuhincode: number,
    at: Date | string
  ): Promise<m.IyakuhinMaster> {
    return get(
      "get-iyakuhin-master",
      { iyakuhincode: iyakuhincode.toString(), at: dateParam(at) },
      m.IyakuhinMaster.cast
    );
  },

  searchKizaiMaster(text: string, at: Date | string): Promise<m.KizaiMaster[]> {
    return get(
      "search-kizai-master",
      { text, at: dateParam(at) },
      castList(m.KizaiMaster.cast)
    );
  },

  getKizaiMaster(kizaicode: number, at: Date | string): Promise<m.KizaiMaster> {
    return get(
      "get-kizai-master",
      { kizaicode: kizaicode.toString(), at: dateParam(at) },
      m.KizaiMaster.cast
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

  updateConductShinryou(
    conductShinryou: m.ConductShinryou
  ): Promise<m.ConductShinryou> {
    return post(
      "update-conduct-shinryou",
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

  findConduct(conductId: number): Promise<m.Conduct | null> {
    return get(
      "find-conduct",
      { "conduct-id": conductId.toString() },
      castOption(m.Conduct.cast)
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
      castListOpt(m.DiseaseData.castFromTuple)
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
    return get(
      "delete-disease-ex",
      { "disease-id": diseaseId.toString() },
      castBoolean
    );
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

  updateDisease(disease: m.Disease): Promise<boolean> {
    return post("update-disease", disease, {}, castBoolean);
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
          castList(pipe(toKouhi, interfaceToKouhi))(kouhiList),
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

  enterKouhi(kouhi: m.KouhiInterface): Promise<m.Kouhi> {
    return post("enter-kouhi", kouhi, {}, pipe(toKouhi, interfaceToKouhi));
  },

  getShahokokuho(shahokokuhoId: number): Promise<m.Shahokokuho> {
    return get(
      "get-shahokokuho",
      { "shahokokuho-id": shahokokuhoId.toString() },
      m.Shahokokuho.cast
    );
  },

  getKoukikourei(koukikoureiId: number): Promise<m.Koukikourei> {
    return get(
      "get-koukikourei",
      { "koukikourei-id": koukikoureiId.toString() },
      m.Koukikourei.cast
    );
  },

  getKouhi(kouhiId: number): Promise<m.Kouhi> {
    return get(
      "get-kouhi",
      { "kouhi-id": kouhiId.toString() },
      pipe(toKouhi, interfaceToKouhi)
    );
  },

  updateShahokokuho(shahokokuho: m.Shahokokuho): Promise<number> {
    return post("update-shahokokuho", shahokokuho, {}, castNumber);
  },

  updateKoukikourei(koukikourei: m.Koukikourei): Promise<boolean> {
    return post("update-koukikourei", koukikourei, {}, castBoolean);
  },

  updateRoujin(roujin: m.Roujin): Promise<boolean> {
    return post("update-roujin", roujin, {}, castBoolean);
  },

  updateKouhi(kouhi: m.KouhiInterface): Promise<boolean> {
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
        },
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
    return get(
      "get-appoint-time",
      { "appoint-time-id": appointTimeId.toString() },
      m.AppointTime.cast
    );
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

  appointHistoryAt(appointTimeId: number): Promise<m.AppEvent[]> {
    return get(
      "appoint-history-at",
      { "appoint-time-id": appointTimeId.toString() },
      castList(m.AppEvent.cast)
    );
  },

  getOnshi(visitId: number): Promise<m.Onshi> {
    return get("get-onshi", { "visit-id": visitId.toString() }, m.Onshi.cast);
  },

  async findOnshi(visitId: number): Promise<m.Onshi | undefined> {
    const o = await get(
      "find-onshi",
      { "visit-id": visitId.toString() },
      castOption(m.Onshi.cast)
    );
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
    return post("new-shahokokuho", shahokokuho, {}, m.Shahokokuho.cast);
  },

  newKoukikourei(koukikourei: m.Koukikourei): Promise<m.Koukikourei> {
    return post("new-koukikourei", koukikourei, {}, m.Koukikourei.cast);
  },

  shahokokuhoUsageSince(
    shahokokuhoId: number,
    since: Date | string
  ): Promise<m.Visit[]> {
    return get(
      "shahokokuho-usage-since",
      {
        "shahokokuho-id": shahokokuhoId.toString(),
        date: dateParam(since),
      },
      castList(m.Visit.cast)
    );
  },

  shahokokuhoUsage(shahokokuhoId: number): Promise<m.Visit[]> {
    return get(
      "shahokokuho-usage",
      {
        "shahokokuho-id": shahokokuhoId.toString(),
      },
      castList(m.Visit.cast)
    );
  },

  koukikoureiUsageSince(
    koukikoureiId: number,
    since: Date | string
  ): Promise<m.Visit[]> {
    return get(
      "koukikourei-usage-since",
      {
        "koukikourei-id": koukikoureiId.toString(),
        date: dateParam(since),
      },
      castList(m.Visit.cast)
    );
  },

  koukikoureiUsage(koukikoureiId: number): Promise<m.Visit[]> {
    return get(
      "koukikourei-usage",
      {
        "koukikourei-id": koukikoureiId.toString(),
      },
      castList(m.Visit.cast)
    );
  },

  kouhiUsageSince(kouhiId: number, since: Date | string): Promise<m.Visit[]> {
    return get(
      "kouhi-usage-since",
      {
        "kouhi-id": kouhiId.toString(),
        date: dateParam(since),
      },
      castList(m.Visit.cast)
    );
  },

  kouhiUsage(kouhiId: number): Promise<m.Visit[]> {
    return get(
      "kouhi-usage",
      {
        "kouhi-id": kouhiId.toString(),
      },
      castList(m.Visit.cast)
    );
  },

  listConductForVisit(visitId: number): Promise<m.Conduct[]> {
    return get(
      "list-conduct-for-visit",
      {
        "visit-id": visitId.toString(),
      },
      castList(m.Conduct.cast)
    );
  },

  listVisitIdByPatientAndMonth(
    patientId: number,
    year: number,
    month: number
  ): Promise<number[]> {
    return get(
      "list-visit-id-by-patient-and-month",
      {
        "patient-id": patientId.toString(),
        year: year.toString(),
        month: month.toString(),
      },
      castList(castNumber)
    );
  },

  batchEnterOrUpdateHoken(
    shahokokuhoList: m.Shahokokuho[],
    koukikoureiList: m.Koukikourei[]
  ): Promise<[m.Shahokokuho[], m.Koukikourei[]]> {
    return post(
      "batch-enter-or-update-hoken",
      {
        shahokokuhoList,
        koukikoureiList,
      },
      {},
      castPair(castList(m.Shahokokuho.cast), castList(m.Koukikourei.cast))
    );
  },

  countShahokokuhoUsage(shahokokuhoId: number): Promise<number> {
    return get(
      "count-shahokokuho-usage",
      { "shahokokuho-id": shahokokuhoId.toString() },
      castNumber
    );
  },

  countShahokokuhoUsageBefore(
    shahokokuhoId: number,
    date: string | Date
  ): Promise<number> {
    return get(
      "count-shahokokuho-usage-before",
      {
        "shahokokuho-id": shahokokuhoId.toString(),
        date: dateParam(date),
      },
      castNumber
    );
  },

  countShahokokuhoUsageAfter(
    shahokokuhoId: number,
    date: string | Date
  ): Promise<number> {
    return get(
      "count-shahokokuho-usage-after",
      {
        "shahokokuho-id": shahokokuhoId.toString(),
        date: dateParam(date),
      },
      castNumber
    );
  },

  countKoukikoureiUsage(koukikoureiId: number): Promise<number> {
    return get(
      "count-koukikourei-usage",
      { "koukikourei-id": koukikoureiId.toString() },
      castNumber
    );
  },

  countKoukikoureiUsageBefore(
    koukikoureiId: number,
    date: string | Date
  ): Promise<number> {
    return get(
      "count-koukikourei-usage-before",
      {
        "koukikourei-id": koukikoureiId.toString(),
        date: dateParam(date),
      },
      castNumber
    );
  },

  countKoukikoureiUsageAfter(
    koukikoureiId: number,
    date: string | Date
  ): Promise<number> {
    return get(
      "count-koukikourei-usage-after",
      {
        "koukikourei-id": koukikoureiId.toString(),
        date: dateParam(date),
      },
      castNumber
    );
  },

  countKouhiUsage(kouhiId: number): Promise<number> {
    return get(
      "count-kouhi-usage",
      { "kouhi-id": kouhiId.toString() },
      castNumber
    );
  },

  countKouhiUsageBefore(kouhiId: number, date: string | Date): Promise<number> {
    return get(
      "count-kouhi-usage-before",
      {
        "kouhi-id": kouhiId.toString(),
        date: dateParam(date),
      },
      castNumber
    );
  },

  countKouhiUsageAfter(kouhiId: number, date: string | Date): Promise<number> {
    return get(
      "count-kouhi-usage-after",
      {
        "kouhi-id": kouhiId.toString(),
        date: dateParam(date),
      },
      castNumber
    );
  },

  getClinicInfo(): Promise<m.ClinicInfo> {
    return get("get-clinic-info", {}, m.ClinicInfo.cast);
  },

  batchGetChargePayment(
    visitIds: number[]
  ): Promise<[number, m.Charge | null, m.Payment | null][]> {
    return post(
      "batch-get-charge-payment",
      visitIds,
      {},
      castList(
        castTuple3(
          castNumber,
          castOption(m.Charge.cast),
          castOption(m.Payment.cast)
        )
      )
    );
  },

  // (placeholder) not implemented yet in server
  // findLastPayment(visitId: number): Promise<m.Payment | undefined> {
  //   return get("find-last-payment", { "visit-id": visitId.toString() },
  //     castOptionUndefined(m.Payment.cast)
  //   )
  // },

  listVisitByMonth(year: number, month: number): Promise<m.Visit[]> {
    return get(
      "list-visit-by-month",
      { year: year.toString(), month: month.toString() },
      castList(m.Visit.cast)
    );
  },

  getHokenInfoForVisit(visitId: number): Promise<m.HokenInfo> {
    return get(
      "get-hoken-info-for-visit",
      { "visit-id": visitId.toString() },
      m.HokenInfo.cast
    );
  },

  listDiseaseActiveAt(
    patientId: number,
    from: Date | string,
    upto: Date | string
  ): Promise<m.Disease[]> {
    return get(
      "list-disease-active-at",
      {
        "patient-id": patientId.toString(),
        from: dateParam(from),
        upto: dateParam(upto),
      },
      castList(m.Disease.cast)
    );
  },

  listPatientByOnshiName(onshiName: string): Promise<m.Patient[]> {
    return get(
      "list-patient-by-onshi-name",
      { text: onshiName },
      castList(m.Patient.cast)
    );
  },

  listVisitIdInDateInterval(
    fromDate: string,
    uptoDate: string
  ): Promise<number[]> {
    return get(
      "list-visit-id-in-date-interval",
      { from: fromDate, upto: uptoDate },
      castList(castNumber)
    );
  },

  listVisitIdByDateIntervalAndPatient(
    fromDate: string,
    uptoDate: string,
    patientId: number
  ): Promise<number[]> {
    return get(
      "list-visit-id-by-date-interval-and-patient",
      { from: fromDate, upto: uptoDate, "patient-id": patientId.toString() },
      castList(castNumber)
    );
  },

  getPharmaAddr(): Promise<any> {
    return get("list-pharma-addr", {}, (a) => a);
  },

  getPharmaData(): Promise<string> {
    return getText("list-pharma-data", {});
  },

  createMultiPagePdfFile(
    opsList: Op[][],
    paperSize: string,
    fileName: string
  ): Promise<void> {
    return post(
      "create-multi-page-pdf-file",
      opsList,
      {
        "paper-size": paperSize,
        "file-name": fileName,
      },
      (_) => {}
    );
  },

  getShujiiMasterText(patientId: number): Promise<string> {
    return getText("get-shujii-master-text", {
      "patient-id": patientId.toString(),
    });
  },

  saveShujiiMasterText(patient: m.Patient, text: string): Promise<void> {
    return post(
      "save-shujii-master-text",
      text,
      { "patient-id": patient.patientId.toString() },
      (_) => {}
    );
  },

  getRyouyouKeikakushoMasterText(patientId: number): Promise<any> {
    return get(
      "get-ryouyou-keikakusho-master-text",
      { "patient-id": patientId.toString() },
      (a) => a
    );
  },

  saveRyouyouKeikakushoMasterText(
    patientId: number,
    text: string
  ): Promise<boolean> {
    return postRaw(
      "save-ryouyou-keikakusho-master-text",
      text,
      { "patient-id": patientId.toString() },
      castBoolean
    );
  },

  getConfig(name: string): Promise<any> {
    return get("get-config", { name }, (a) => a);
  },

  getConfigRaw(name: string): Promise<string> {
    return getText("get-config", { name });
  },

  setConfig(name: string, content: any): Promise<void> {
    return post("set-config", content, { name }, (a) => a);
  },

  selectUsageMasterByUsageName(name: string): Promise<m.UsageMaster[]> {
    return get(
      "select-usage-master-by-usage-name",
      { name },
      (a) => a as m.UsageMaster[]
    );
  },

  getShohouFreqUsage(): Promise<FreqUsage[]> {
    return get("get-config", { name: "shohou-freq-usage" }, (a) => a ?? []);
  },

  saveShohouFreqUsage(usages: FreqUsage[]): Promise<void> {
    return post("set-config", usages, { name: "shohou-freq-usage" }, (a) => a);
  },

  getShohouFreqPrescription(): Promise<{ presc: RP剤情報; comment: string }[]> {
    return get(
      "get-config",
      { name: "shohou-freq-prescription" },
      (a) => a ?? []
    );
  },

  saveShohouFreqPrescription(usages: {
    presc: RP剤情報;
    comment: string;
  }): Promise<void> {
    return post(
      "set-config",
      usages,
      { name: "shohou-freq-prescription" },
      (a) => a
    );
  },

  getDrugDiseases(): Promise<DrugDisease[]> {
    return get("get-config", { name: "drug-disease" }, (a) => a ?? []);
  },

  setDrugDiseases(drugDiseases: DrugDisease[]): Promise<void> {
    return post("set-config", drugDiseases, { name: "drug-disease" }, (a) => a);
  },

  getShinryouDiseases(): Promise<ShinryouDisease[]> {
    return get(
      "get-config",
      { name: "shinryou-disease" },
      castListOpt(validateShinryouDisease)
    );
  },

  setShinryouDiseases(shinryouDiseases: ShinryouDisease[]): Promise<void> {
    return post(
      "set-config",
      shinryouDiseases,
      { name: "shinryou-disease" },
      (a) => a
    );
  },

  getHokengaiHistory(): Promise<string[]> {
    return get("get-config", { name: "hokengai-history" }, (a) => a ?? []);
  },

  setHokengaiHistory(hokengaiHistory: string[]): Promise<void> {
    return post(
      "set-config",
      hokengaiHistory,
      { name: "hokengai-history" },
      (a) => a
    );
  },

  getUsageMasterMap(): Promise<Record<string, 用法レコード>> {
    return get("get-config", { name: "usage-master-map" }, (a) => a ?? {});
  },

  setUsageMasterMap(map: Record<string, 用法レコード>) {
    return post("set-config", map, { name: "usage-master-map" }, (a) => a);
  },

  getDrugNameIyakuhincodeMap(): Promise<Record<string, DrugNameBind>> {
    return get(
      "get-config",
      { name: "drug-name-iyakuhincode-map" },
      (a) => a ?? {}
    );
  },

  setDrugNameIyakuhincodeMap(
    map: Record<string, DrugNameBind>
  ): Promise<void> {
    return post(
      "set-config",
      map,
      { name: "drug-name-iyakuhincode-map" },
      () => {}
    );
  },

  decodeBase64ToFile(filename: string, base64: string): Promise<boolean> {
    return postRaw(
      "decode-base64-to-file",
      base64,
      { "file-name": filename },
      (a) => a
    );
  },

  listShinryouForVisit(visitId: number): Promise<m.Shinryou[]> {
    return get(
      "list-shinryou-for-visit",
      { "visit-id": visitId.toString() },
      castList(m.Shinryou.cast)
    );
  },

  searchDupPatient(): Promise<DupPatient[]> {
    return get("search-dup-patient", {}, castList(validateDupPatient));
  },

  deletePatient(patientId: number): Promise<boolean> {
    return get(
      "delete-patient",
      { "patient-id": patientId.toString() },
      castBoolean
    );
  },

  sendmail(mail: {
    to: string;
    from: string;
    subject: string;
    content: string;
  }): Promise<boolean> {
    return post("sendmail", mail, {}, castBoolean);
  },

  listConfigKey(): Promise<string[]> {
    return get("list-config-key", {}, castList(castString));
  },

  listPrescForPatient(patientId: number, limit: number, offset: number): Promise<[m.Text, m.Visit][]> {
    return get("list-presc-for-patient", {
      "patient-id": patientId.toString(),
      limit: limit.toString(),
      offset: offset.toString()
    }, _ => _)
  },

  getUsageMaster(code: string): Promise<m.UsageMaster> {
    return get("get-usage-master", { code, }, a => a);
  }
};
