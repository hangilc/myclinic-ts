import type { ClinicInfo, UsageMaster } from "myclinic-model";
import api from "./api";

let clinicInfo: ClinicInfo | undefined = undefined;
let hpkiUrl: string | undefined = undefined;
let prescUrl: string | undefined = undefined;
let shohouFreqUsage: UsageMaster[] | undefined = undefined;

export async function getClinicInfo(): Promise<ClinicInfo> {
  if( !clinicInfo ){
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
  if( hpkiUrl === undefined ){
    let server = await api.getConfig("hpki-server");
    let url = server.url;
    if( typeof url !== "string" ){
      throw new Error("Cannot find hpki server url.");
    }
    hpkiUrl = url;
  }
  return hpkiUrl;
}

export async function getPrescUrl(): Promise<string> {
  if( prescUrl === undefined ){
    let server = await api.getConfig("presc-server");
    let url = server.url;
    if( typeof url !== "string" ){
      throw new Error("Cannot find presc server url.");
    }
    prescUrl = url;
  }
  return prescUrl;
}

export async function getShohouFreqUsage(): Promise<UsageMaster[]> {
  if( shohouFreqUsage === undefined ){
    let value = await api.getShohouFreqUsage();
    if( !value ){
      value = [];
    }
    shohouFreqUsage = value;
  }
  return shohouFreqUsage;
}

export function clearShohouFreqUsage() {
  shohouFreqUsage = undefined;
}
