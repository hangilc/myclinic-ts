import type { ClinicInfo } from "myclinic-model";
import api from "./api";

let clinicInfo: ClinicInfo | undefined = undefined;
let hpkiUrl: string | undefined = undefined;
let prescUrl: string | undefined = undefined;

export async function getClinicInfo(): Promise<ClinicInfo> {
  if( !clinicInfo ){
    clinicInfo = await api.getClinicInfo();
  }
  return clinicInfo;
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