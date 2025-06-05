import api from "@/lib/api";
import type { FormData } from "./form-data";

export async function getRyouyouKeikakushoMasterText(patientId: number): Promise<Partial<FormData>[]> {
  try {
    let result = await api.getRyouyouKeikakushoMasterText(patientId);
    console.log("result", result);
    return result;
  } catch(e) {
    console.error(e);
    return [];
  }
}
