import api from "@/lib/api";
import { calcPages } from "@/lib/calc-pages";

let itemsPerPage: number = 10;

export async function countRecordPages(patientId: number): Promise<number> {
  const nvisits: number = await api.countVisitByPatient(patientId);
  return calcPages(nvisits, itemsPerPage);
}

export async function fetchRecords(patientId: number, page: number) {
  return await api.listVisitByPatientReverse(patientId, itemsPerPage * page, itemsPerPage);
}
