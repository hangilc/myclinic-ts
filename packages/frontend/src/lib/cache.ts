import type { ClinicInfo, UsageMaster } from "myclinic-model";
import api from "./api";
import { type RP剤情報, type 用法レコード, type 用法補足レコード, 用法レコードObject, 用法補足レコードObject } from "./denshi-shohou/presc-info";

let clinicInfo: ClinicInfo | undefined = undefined;
let hpkiUrl: string | undefined = undefined;
let prescUrl: string | undefined = undefined;
let shohouFreqUsage: FreqUsage[] | undefined = undefined;
let shohouFreqPrescription: FreqPresc[] | undefined = undefined;

export type FreqUsage = {
  剤型区分: "内服" | "頓服" | "外用";
  用法コード: string;
  用法名称: string;
}

export type FreqPresc = {
  presc: RP剤情報;
  comment: string;
}

export async function getClinicInfo(): Promise<ClinicInfo> {
  if (!clinicInfo) {
    clinicInfo = await api.getClinicInfo();
  }
  return clinicInfo;
}

export async function getShohouKikancode(): Promise<string> {
  let clinicInfo = await getClinicInfo();
  let kikancode = "131" + clinicInfo.kikancode;
  return `${clinicInfo.todoufukencode}${clinicInfo.tensuuhyoucode}${clinicInfo.kikancode}`;
}

export async function getHpkiUrl(): Promise<string> {
  if (hpkiUrl === undefined) {
    let server = await api.getConfig("hpki-server");
    let url = server.url;
    if (typeof url !== "string") {
      throw new Error("Cannot find hpki server url.");
    }
    hpkiUrl = url;
  }
  return hpkiUrl;
}

export async function getPrescUrl(): Promise<string> {
  if (prescUrl === undefined) {
    let server = await api.getConfig("presc-server");
    let url = server.url;
    if (typeof url !== "string") {
      throw new Error("Cannot find presc server url.");
    }
    prescUrl = url;
  }
  return prescUrl;
}

export async function getShohouFreqUsage(): Promise<FreqUsage[]> {
  if (shohouFreqUsage === undefined) {
    let value = await api.getShohouFreqUsage();
    if (!value) {
      value = [];
    }
    shohouFreqUsage = value;
  }
  return shohouFreqUsage;
}

export async function invalidateShohouFreqUsage() {
  shohouFreqUsage = undefined;
}

export async function getShohouFreqPrescription(): Promise<FreqPresc[]> {
  if (shohouFreqPrescription === undefined) {
    let value = await api.getShohouFreqPrescription();
    if (!value) {
      value = [];
    }
    shohouFreqPrescription = value;
  }
  return shohouFreqPrescription ?? [];
}

export function invalidateShohouFreqPrescription() {
  shohouFreqPrescription = undefined;
}
