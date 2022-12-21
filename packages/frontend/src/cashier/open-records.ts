import api from "@/lib/api";
import { calcPages } from "@/lib/calc-pages";
import RecordList from "./RecordList.svelte";

let itemsPerPage: number = 10;

async function countRecordPages(patientId: number): Promise<number> {
  const nvisits: number = await api.countVisitByPatient(patientId);
  return calcPages(nvisits, itemsPerPage);
}

async function fetchRecords(patientId: number, page: number) {
  return await api.listVisitEx(patientId, itemsPerPage * page, itemsPerPage);
}

export async function openRecords(patientId: number) {
  const totalPages = await countRecordPages(patientId);
  const records = await fetchRecords(patientId, 0);
  const d: RecordList = new RecordList({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
      totalPages,
      records,
    }
  })
}