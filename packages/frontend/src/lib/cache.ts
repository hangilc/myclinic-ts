import type { ClinicInfo, UsageMaster } from "myclinic-model";
import api from "./api";
import { type RP剤情報, type 用法レコード, type 用法補足レコード, 用法レコードObject, 用法補足レコードObject } from "./denshi-shohou/presc-info";
import type { DrugDisease } from "./drug-disease";

let clinicInfo: ClinicInfo | undefined = undefined;
let hpkiUrl: string | undefined = undefined;
let prescUrl: string | undefined = undefined;
let shohouFreqUsage: FreqUsage[] | undefined = undefined;
let shohouFreqPrescription: FreqPresc[] | undefined = undefined;
let onshiViewSecret: string | undefined = undefined;
let drugDiseases: DrugDisease[] | undefined = undefined;
let hokengaiHistory: string[] | undefined = undefined;

export type FreqUsage = {
  剤型区分: "内服" | "頓服" | "外用";
  用法コード: string;
  用法名称: string;
}

export type FreqPresc = {
  presc: RP剤情報;
  comment: string;
}

export const cache = {
  async getClinicInfo(): Promise<ClinicInfo> {
    if (!clinicInfo) {
      clinicInfo = await api.getClinicInfo();
    }
    return clinicInfo;
  },

  async getShohouKikancode(): Promise<string> {
    let clinicInfo = await cache.getClinicInfo();
    return `${clinicInfo.todoufukencode}${clinicInfo.tensuuhyoucode}${clinicInfo.kikancode}`;
  },

  async getHpkiUrl(): Promise<string> {
    if (hpkiUrl === undefined) {
      let server = await api.getConfig("hpki-server");
      let url = server.url;
      if (typeof url !== "string") {
        throw new Error("Cannot find hpki server url.");
      }
      hpkiUrl = url;
    }
    return hpkiUrl;
  },

  async getPrescUrl(): Promise<string> {
    if (prescUrl === undefined) {
      let server = await api.getConfig("presc-server");
      let url = server.url;
      if (typeof url !== "string") {
        throw new Error("Cannot find presc server url.");
      }
      prescUrl = url;
    }
    return prescUrl;
  },

  async getShohouFreqUsage(): Promise<FreqUsage[]> {
    if (shohouFreqUsage === undefined) {
      let value = await api.getShohouFreqUsage();
      if (!value) {
        value = [];
      }
      shohouFreqUsage = value;
    }
    return shohouFreqUsage;
  },

  clearShohouFreqUsage() {
    shohouFreqUsage = undefined;
  },
  
  async getOnshiViewSecret(): Promise<string> {
    if (onshiViewSecret === undefined) {
      onshiViewSecret = await api.dictGet("onshi-secret");
    }
    return onshiViewSecret;
  },

  async getDrugDiseases(): Promise<DrugDisease[]> {
    if( drugDiseases === undefined ){
      drugDiseases = await api.getDrugDiseases();
    }
    return drugDiseases;
  },

  clearDrugDiseases() {
    drugDiseases = undefined;
  },

  async getHokengaiHistory(): Promise<string[]> {
    if( hokengaiHistory === undefined ){
      hokengaiHistory = await api.getHokengaiHistory();
    }
    return hokengaiHistory;
  },

  clearHokengaiHistory() {
    hokengaiHistory = undefined;
  },
}
