import api from "@/lib/api";
import type { Patient } from "myclinic-model";

let serialId = 1;

export interface DupWrapper {
  id: number;
  patient1: Patient;
  patient2: Patient;
  detail: boolean;
}

export async function searchDupPatient(): Promise<DupWrapper[]> {
  let result = await api.searchDupPatient();
  return result.map(r => Object.assign(r, { id: serialId++, detail: false  }));
}
