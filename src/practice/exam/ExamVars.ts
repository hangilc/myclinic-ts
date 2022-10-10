import { writable, type Writable, get } from "svelte/store";
import * as m from "../../lib/model";
import api from "../../lib/api";
import { TaskFactory as tf,  TaskRunner, type Task } from "../../lib/unit-task";

export const currentPatient: Writable<m.Patient | null> = writable(null);
export const currentVisitId: Writable<number | null> = writable(null);
export const visits: Writable<m.VisitEx[]> = writable([]);
export const navPage: Writable<number> = writable(0);
export const navTotal: Writable<number> = writable(0);

export const recordsPerPage = 10;

export const reqChangePatient: Writable<[m.Patient, number | null] | null> = writable(null);

const taskRunner: TaskRunner = new TaskRunner();

function resetVisits(): void {
  visits.set([]);
}

function fetchVisits(patientId: number, page: number): Task {
  return tf.fetch<m.VisitEx[]>(() => 
    api.listVisitEx(patientId, page * recordsPerPage, recordsPerPage),
    result => visits.set(result));
}

function initNav(patientId: number): Task {
  return tf.fetch(() => api.countVisitByPatient(patientId),
    result => {
      navPage.set(0);
      navTotal.set(Math.floor((result + recordsPerPage - 1) / recordsPerPage));
    })
}

function resetNav(): void {
  navPage.set(0);
  navTotal.set(0);
}

export function advanceNavPage(diff: number) {
  const page = get(navPage)
  const total = get(navTotal);
  let newPage = page + diff;
  if( newPage >= total ){
    newPage = total - 1;
  }
  if( newPage < 0 ){
    newPage = 0;
  }
  if( newPage !== page ){
    const patient = get(currentPatient);
    if( patient !== null ){
      navPage.set(newPage);
      taskRunner.run(fetchVisits(patient?.patientId, newPage));
    }
  }
}

export function gotoNavFirstPage() {
  const page = get(navPage);
  advanceNavPage(-page);
}

export function gotoNavLastPage() {
  const page = get(navPage)
  const total = get(navTotal);
  advanceNavPage(total - 1 - page);
}

async function suspendVisit(visitId: number): Promise<void> {
  await api.changeWqueueState(visitId, m.WqueueState.WaitReExam);
}

function resetAll(): void {
  currentPatient.set(null);
  currentVisitId.set(null);
  resetVisits();
  resetNav();
}

reqChangePatient.subscribe(async value => {
  taskRunner.cancel();
  let currentVisitIdValue: number | null = get(currentVisitId);
  if( currentVisitIdValue !== null ){
    await suspendVisit(currentVisitIdValue).catch(ex => console.error(ex));
  }
  resetAll();
  if( value !== null ){
    const [patient, visitIdOpt] = value;
    currentPatient.set(patient);
    currentVisitId.set(visitIdOpt);
    taskRunner.run(
      fetchVisits(patient.patientId, 0),
      initNav(patient.patientId)
    );
  }
});

export const showPatientsByDate: Writable<boolean> = writable(false);
