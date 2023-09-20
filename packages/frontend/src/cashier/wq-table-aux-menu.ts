import api from "@/lib/api";
import { confirm } from "@/lib/confirm-call";
import type { Patient, Visit } from "myclinic-model";
import { PatientData } from "./patient-dialog/patient-data";
import type { EventEmitter } from "@/lib/event-emitter";

// export let patient: Patient;
// export let visit: Visit;
// export let hotlineTrigger: EventEmitter<string> | undefined = undefined;

export function doPatient(patient: Patient, hotlineTrigger?: EventEmitter<string>) {
  PatientData.start(patient, { hotlineTrigger });
}

export async function doDeleteVisit(visit: Visit) {
  confirm("この診察を削除しますか？", async () => {
    await deleteVisit(visit.visitId);
  });
}

async function deleteVisit(visitId: number) {
  try {
    await api.deleteVisitFromReception(visitId);
  } catch (e) {
    alert("削除できませんでした。");
  }
}

// <div data-cy="wq-row-aux-menu">
//   <a href="javascript:void(0)" on:click={doPatient}>患者</a>
//   <a href="javascript:void(0)" on:click={doDeleteVisit}>削除</a>
// </div>

// <style>
//   a {
//     display: block;
//     margin: 4px 0;
//   }
// </style>