import type { ClinicInfo, DiseaseExample, UsageMaster } from "myclinic-model";
import api from "./api";
import { type RP剤情報, type 用法レコード, type 用法補足レコード, 用法レコードObject, 用法補足レコードObject } from "./denshi-shohou/presc-info";
import type { DrugDisease } from "./drug-disease";
import type { ShinryouDisease } from "./shinryou-disease";
import type { 薬品コード種別 } from "./denshi-shohou/denshi-shohou";

let clinicInfo: ClinicInfo | undefined = undefined;
let hpkiUrl: string | undefined = undefined;
let prescUrl: string | undefined = undefined;
let shohouFreqUsage: FreqUsage[] | undefined = undefined;
let shohouFreqPrescription: FreqPresc[] | undefined = undefined;
let onshiViewSecret: string | undefined = undefined;
let drugDiseases: DrugDisease[] | undefined = undefined;
let shinryouDiseases: ShinryouDisease[] | undefined = undefined;
let hokengaiHistory: string[] | undefined = undefined;
let diseaseExamples: DiseaseExample[] | undefined = undefined;
let usageMasterMap: Record<string, 用法レコード> | undefined = undefined;
let drugNameMap: Record<string, { codeKind: 薬品コード種別, code: string }> | undefined
  = undefined;

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
    if (drugDiseases === undefined) {
      drugDiseases = await api.getDrugDiseases();
    }
    return drugDiseases;
  },

  clearDrugDiseases() {
    drugDiseases = undefined;
  },

  async getShinryouDiseases(): Promise<ShinryouDisease[]> {
    if (shinryouDiseases === undefined) {
      shinryouDiseases = await api.getShinryouDiseases();
    }
    return shinryouDiseases;
  },

  async setShinryouDiseases(newShinryouDiseases: ShinryouDisease[]): Promise<void> {
    await api.setShinryouDiseases(newShinryouDiseases);
    shinryouDiseases = newShinryouDiseases;
  },

  async getHokengaiHistory(): Promise<string[]> {
    if (hokengaiHistory === undefined) {
      hokengaiHistory = await api.getHokengaiHistory();
    }
    return hokengaiHistory;
  },

  clearHokengaiHistory() {
    hokengaiHistory = undefined;
  },

  async getDiseaseExamples(): Promise<DiseaseExample[]> {
    if (diseaseExamples === undefined) {
      diseaseExamples = await api.listDiseaseExample();
    }
    return diseaseExamples;
  },

  async getUsageMasterMap(): Promise<Record<string, 用法レコード>> {
    if (usageMasterMap === undefined) {
      const r: Record<string, 用法レコード> = await api.getUsageMasterMap();
      usageMasterMap = r;
    }
    return usageMasterMap;
  },

  async setUsageMasterMap(map: Record<string, 用法レコード>) {
    await api.setUsageMasterMap(map);
    usageMasterMap = map;
  },

  async getDrugNameMap(): Promise<Record<string, { codeKind: 薬品コード種別, code: string }>> {
    if (drugNameMap === undefined) {
      const r: Record<string, { codeKind: 薬品コード種別, code: string }> =
        await api.getDrugNameMap();
      drugNameMap = r;
    }
    return drugNameMap;
  },

  async setDrugNameMap(map: Record<string, { codeKind: 薬品コード種別, code: string }>) {
    await api.setDrugNameMap(map);
    drugNameMap = map;
  },

}
