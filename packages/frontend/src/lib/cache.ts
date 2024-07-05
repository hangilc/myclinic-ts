import type { ClinicInfo } from "myclinic-model";
import api from "./api";

let clinicInfo: ClinicInfo | undefined = undefined;

export async function getClinicInfo(): Promise<ClinicInfo> {
  if( !clinicInfo ){
    clinicInfo = await api.getClinicInfo();
  }
  return clinicInfo;
}