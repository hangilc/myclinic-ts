import api from "@/lib/api";
import type { Patient } from "myclinic-model";
import RecordList from "./RecordList.svelte";

export async function openRecords(patient: Patient) {
  let patientId = patient.patientId;
  const totalVisits: number = await api.countVisitByPatient(patientId);
  const d: RecordList = new RecordList({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
      totalVisits,
      patient,
    }
  })
}
