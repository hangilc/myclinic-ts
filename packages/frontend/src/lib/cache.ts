import type { ClinicInfo, DiseaseExample } from "myclinic-model";
import api from "./api";
import { type RP剤情報, type 用法レコード, } from "./denshi-shohou/presc-info";
import type { DrugDisease } from "./drug-disease";
import { validateDxKasanSeries, type DxKasanApplied } from "./dx-kasan";
import type { ShinryouDisease } from "./shinryou-disease";
import { validateAppointsTemplate, type AppointsTemplate } from "@/appoint/appoints-template";

let clinicInfo: ClinicInfo | undefined = undefined;
let hpkiUrl: string | undefined = undefined;
let prescUrl: string | undefined = undefined;
let shohouFreqUsage: FreqUsage[] | undefined = undefined;
let onshiViewSecret: string | undefined = undefined;
let drugDiseases: DrugDisease[] | undefined = undefined;
let shinryouDiseases: ShinryouDisease[] | undefined = undefined;
let hokengaiHistory: string[] | undefined = undefined;
let diseaseExamples: DiseaseExample[] | undefined = undefined;
let usageMasterMap: Record<string, 用法レコード> | undefined = undefined;
let drugNameIyakuhincodeMap: Record<string, number> | undefined = undefined;
let onshiServer: string | undefined = undefined;
let dxKasanSeries: DxKasanApplied[] | undefined = undefined;
let doctorEmail: string | undefined = undefined;
let appointsTemplate: AppointsTemplate | undefined = undefined;

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
    usageMasterMap = map;
    await api.setUsageMasterMap(map);
  },

  async getDrugNameIyakuhincodeMap(): Promise<Record<string, number>> {
    if( drugNameIyakuhincodeMap === undefined ){
      const map: Record<string, number> = await api.getDrugNameIyakuhincodeMap();
      drugNameIyakuhincodeMap = map;
    }
    return drugNameIyakuhincodeMap;
  },

  async setDrugNameIyakuhincodeMap(map: Record<string, number>): Promise<void> {
    drugNameIyakuhincodeMap = map;
    await api.setDrugNameIyakuhincodeMap(map);
  },

  async getOnshiServer(): Promise<string> {
    if( onshiServer === undefined ){
      const value = await api.dictGet("onshi-server");
      onshiServer = value;
    }
    return onshiServer;
  },

  async setOnshiServer(value: string): Promise<void> {
    onshiServer = value;
    await api.dictSet("onshi-server", value);
  },

  async getDxKasanSeries(): Promise<DxKasanApplied[]> {
    if( dxKasanSeries === undefined ){
      let value = await api.getConfig("dx-kasan");
      if( !value ){
        value = [];
      }
      dxKasanSeries = value;
    }
    return validateDxKasanSeries(dxKasanSeries);
  },

  async clearDxKasanSeries() {
    dxKasanSeries = undefined;
  },

  async setDxKasanSeries(series: DxKasanApplied[]): Promise<void> {
    dxKasanSeries = series;
    await api.setConfig("dx-kasan", series);
  },

  async getDoctorEmail(): Promise<string> {
    if( doctorEmail === undefined ){
      let value = await api.getConfig("doctor-email");
      if( !value ){
        value = "";
      }
      doctorEmail = value;
    }
    return doctorEmail ?? "";
  },

  async setDoctorEmail(value: string): Promise<void> {
    doctorEmail = value;
    await api.setConfig("doctor-email", doctorEmail);
  },

  async getAppointsTemplate(): Promise<AppointsTemplate> {
    if (appointsTemplate === undefined) {
      let value = await api.getConfig("appoints-template");
      appointsTemplate = validateAppointsTemplate(value);
    }
    return appointsTemplate;
  },

  async setAppointsTemplate(value: AppointsTemplate): Promise<void> {
    appointsTemplate = value;
    await api.setConfig("appoints-template", value);
  },

}

