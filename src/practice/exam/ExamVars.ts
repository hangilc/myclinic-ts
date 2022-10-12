import { writable, type Writable, get } from "svelte/store";
import * as m from "../../lib/model";
import api from "../../lib/api";
import { TaskFactory as tf,  TaskRunner, type Task } from "../../lib/unit-task";
import * as appEvent from "@/practice/app-events";

export const currentPatient: Writable<m.Patient | null> = writable(null);
export const currentVisitId: Writable<number | null> = writable(null);
export const tempVisitId: Writable<number | null> = writable(null);
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

function countVisitPages(totalVisits: number): number {
  return Math.floor((totalVisits + recordsPerPage - 1) / recordsPerPage);
}

function initNav(patientId: number): Task {
  return tf.fetch(() => api.countVisitByPatient(patientId),
    result => {
      navPage.set(0);
      navTotal.set(countVisitPages(result));
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

export function gotoPage(page: number): void {
  const curPage = get(navPage);
  if( curPage !== page ){
    advanceNavPage(page - curPage);
  }
}

export function getCopyTarget(): number | null {
  const visitIdValue = get(currentVisitId);
  if( visitIdValue !== null ){
    return visitIdValue;
  }
  const tempVisitIdValue = get(tempVisitId);
  if( tempVisitIdValue !== null ){
    return tempVisitIdValue;
  }
  return null;
}

async function suspendVisit(visitId: number): Promise<void> {
  await api.changeWqueueState(visitId, m.WqueueState.WaitReExam);
}

function resetAll(): void {
  currentPatient.set(null);
  currentVisitId.set(null);
  tempVisitId.set(null);
  resetVisits();
  resetNav();
}

export function setTempVisitId(visitId: number, errorHandler: (err: string) => void): void {
  const currentVistiIdValue = get(currentVisitId);
  if( currentVistiIdValue === null ){
    tempVisitId.set(visitId);
  } else {
    errorHandler("現在診察中なので、暫定診察を設定できません。");
  }
}

export function clearTempVisitId(): void {
  tempVisitId.set(null);
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

appEvent.textEntered.subscribe(text => {
  if( text == null ){
    return;
  }
  const visitsValue: m.VisitEx[] = get(visits);
  let found = false;
  visitsValue.forEach(visit => {
    if( visit.visitId === text.visitId ){
      visit.texts.push(text);
      found = true;
    }
  });
  if( found ){
    visits.set(visitsValue);
  }
});

appEvent.textUpdated.subscribe(text => {
  if( text == null ){
    return;
  }
  const visitsValue: m.VisitEx[] = get(visits);
  let found = false;
  visitsValue.forEach(visit => {
    if( visit.visitId === text.visitId ){
      const index = visit.texts.findIndex(t => t.textId == text.textId);
      if( index >= 0 ){
        visit.texts.splice(index, 1, text);
        found = true;
      }
    }
  });
  if( found ){
    visits.set(visitsValue);
  }
});

appEvent.textDeleted.subscribe(text => {
  if( text == null ){
    return;
  }
  const visitsValue: m.VisitEx[] = get(visits);
  let found = false;
  visitsValue.forEach(visit => {
    if( visit.visitId === text.visitId ){
      const index = visit.texts.findIndex(t => t.textId == text.textId);
      if( index >= 0 ){
        visit.texts.splice(index, 1);
        found = true;
      }
    }
  });
  if( found ){
    visits.set(visitsValue);
  }
});

appEvent.visitDeleted.subscribe(visit => {
  if( visit == null ){
    return;
  }
  console.log("visit deleted", visit);
  const visitsValue: m.VisitEx[] = get(visits);
  const index = visitsValue.findIndex(v => v.visitId == visit.visitId);
  if( index >= 0 ){
    const patient = get(currentPatient);
    if( patient !== null ){
      taskRunner.run(
        tf.fetch(
          () => api.countVisitByPatient(patient.patientId),
          count => {
            const newTotal = countVisitPages(count);
            const navTotalValue = get(navTotal);
            if( navTotalValue !== newTotal ){
              let navPageValue = get(navPage);
              if( navPageValue >= newTotal ){
                navPageValue = newTotal - 1;
                if( navPageValue < 0 ){
                  navPageValue = 0;
                }
                navPage.set(navPageValue);
              }
              navTotal.set(newTotal);
              gotoPage(navPageValue);
            }
          }
        )
      )
    }
        visitsValue.splice(index, 1);
    visits.set(visitsValue);
  }
});

appEvent.wqueueDeleted.subscribe(wqueue => {
  if( wqueue == null ){
    return;
  }
  const currentVisitIdValue = get(currentVisitId);
  if( wqueue.visitId === currentVisitIdValue ){
    currentVisitId.set(null);
  }
})



