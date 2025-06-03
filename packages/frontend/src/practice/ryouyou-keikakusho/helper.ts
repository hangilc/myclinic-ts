import api from "@/lib/api";
import type { FormData } from "./form-data";

export async function getRyouyouKeikakushoMasterText(patientId: number): Promise<Partial<FormData>[]> {
  try {
    return await api.getRyouyouKeikakushoMasterText(patientId);
  } catch(e) {
    console.error(e);
    return [];
  }
}
