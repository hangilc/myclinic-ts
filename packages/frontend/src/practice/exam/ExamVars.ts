import { writable, type Writable, get } from "svelte/store";
import * as m from "../../lib/model";
import api from "../../lib/api";
import { FetchTask, TaskRunner, type Task } from "../../lib/unit-task";
import * as appEvent from "@/practice/app-events";

export const currentPatient: Writable<m.Patient | null> = writable(null);
export const currentVisitId: Writable<number | null> = writable(null);
export const tempVisitId: Writable<number | null> = writable(null);
export const visits: Writable<m.VisitEx[]> = writable([]);
let totalVisits: number = 0;
export const navPage: Writable<number> = writable(0);
export const navTotal: Writable<number> = writable(0);
export const mishuuList: Writable<m.VisitEx[]> = writable([]);

export const recordsPerPage = 10;

export class StartPatientReq {
  patient: m.Patient;
  visitId: number | null;
  isStartPatientReq: boolean = true;

  constructor(patient: m.Patient, visitId?: number){
    this.patient = patient;
    this.visitId = visitId;
  }

}

export class EndPatientReq {
  waitState?: m.WqueueStateData;
  isEndPatientReq: boolean = true;

  constructor(waitState?: m.WqueueStateData) {
    this.waitState = waitState;
  }
}

const reqChangePatient: Writable<StartPatientReq | EndPatientReq | null> = writable(null);

export function startPatient(patient: m.Patient, visitId: number | null = null): void {
  reqChangePatient.set(new StartPatientReq(patient, visitId));
}

export function endPatient(waitState: m.WqueueStateData | null = null): void {
  reqChangePatient.set(new EndPatientReq(waitState));
}

const taskRunner: TaskRunner = new TaskRunner();

function resetVisits(): void {
  visits.set([]);
}

function fetchVisits(patientId: number, page: number): Task {
  return new FetchTask<m.VisitEx[]>(() =>
    api.listVisitEx(patientId, page * recordsPerPage, recordsPerPage),
    result => visits.set(result));
}

function countVisitPages(totalVisits: number): number {
  return Math.floor((totalVisits + recordsPerPage - 1) / recordsPerPage);
}

function initNav(patientId: number): Task {
  return new FetchTask<number>(() => api.countVisitByPatient(patientId),
    result => {
      navPage.set(0);
      navTotal.set(countVisitPages(result));
      totalVisits = result;
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
  if (newPage >= total) {
    newPage = total - 1;
  }
  if (newPage < 0) {
    newPage = 0;
  }
  if (newPage !== page) {
    const patient = get(currentPatient);
    if (patient !== null) {
      navPage.set(newPage);
      taskRunner.run(fetchVisits(patient?.patientId, newPage));
    }
  }
}

export function gotoPage(page: number): void {
  const curPage = get(navPage);
  if (curPage !== page) {
    advanceNavPage(page - curPage);
  }
}

export function getCopyTarget(): number | null {
  const visitIdValue = get(currentVisitId);
  if (visitIdValue !== null) {
    return visitIdValue;
  }
  const tempVisitIdValue = get(tempVisitId);
  if (tempVisitIdValue !== null) {
    return tempVisitIdValue;
  }
  return null;
}

export function addToMishuuList(visit: m.VisitEx): void {
  const mishuuListValue = get(mishuuList);
  if (mishuuListValue.findIndex(v => v.visitId === visit.visitId) < 0) {
    mishuuListValue.push(visit);
    mishuuList.set(mishuuListValue);
    console.log("mishuuList", mishuuListValue);
  }
}

export function clearMishuuList(): void {
  mishuuList.set([]);
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
  clearMishuuList();
}

export function setTempVisitId(visitId: number, errorHandler: (err: string) => void): void {
  const currentVistiIdValue = get(currentVisitId);
  if (currentVistiIdValue === null) {
    tempVisitId.set(visitId);
  } else {
    errorHandler("現在診察中なので、暫定診察を設定できません。");
  }
}

export function clearTempVisitId(): void {
  tempVisitId.set(null);
}

reqChangePatient.subscribe(async value => {
  if( value == null ){
    return;
  } else {
    const visitIdSave: number | null = get(currentVisitId);
    taskRunner.cancel();
    resetAll();
    if (visitIdSave !== null) {
      if( value instanceof EndPatientReq ){
        if( value.waitState != null ){
          await api.changeWqueueState(visitIdSave, value.waitState.code);
        }
      } else {
        await suspendVisit(visitIdSave).catch(ex => console.error(ex));
      }
    }
    if( value instanceof StartPatientReq ){
      const patient: m.Patient = value.patient;
      currentPatient.set(value.patient);
      currentVisitId.set(value.visitId);
      taskRunner.run(
        fetchVisits(patient.patientId, 0),
        initNav(patient.patientId)
      );
      if( value.visitId != null ){
        api.changeWqueueState(value.visitId, m.WqueueState.InExam)
      }
    }
  }
});

export const showPatientsByDate: Writable<boolean> = writable(false);

appEvent.textEntered.subscribe(text => {
  if (text == null) {
    return;
  }
  const visitsValue: m.VisitEx[] = get(visits);
  let found = false;
  visitsValue.forEach(visit => {
    if (visit.visitId === text.visitId) {
      visit.texts.push(text);
      found = true;
    }
  });
  if (found) {
    visits.set(visitsValue);
  }
});

appEvent.textUpdated.subscribe(text => {
  if (text == null) {
    return;
  }
  const visitsValue: m.VisitEx[] = get(visits);
  let found = false;
  visitsValue.forEach(visit => {
    if (visit.visitId === text.visitId) {
      const index = visit.texts.findIndex(t => t.textId == text.textId);
      if (index >= 0) {
        visit.texts.splice(index, 1, text);
        found = true;
      }
    }
  });
  if (found) {
    visits.set(visitsValue);
  }
});

appEvent.textDeleted.subscribe(text => {
  if (text == null) {
    return;
  }
  const visitsValue: m.VisitEx[] = get(visits);
  let found = false;
  visitsValue.forEach(visit => {
    if (visit.visitId === text.visitId) {
      const index = visit.texts.findIndex(t => t.textId == text.textId);
      if (index >= 0) {
        visit.texts.splice(index, 1);
        found = true;
      }
    }
  });
  if (found) {
    visits.set(visitsValue);
  }
});

appEvent.visitEntered.subscribe(async visit => {
  if (visit == null) {
    return;
  }
  const patient: m.Patient | null = get(currentPatient);
  if (patient != null) {
    if (patient.patientId === visit.patientId && get(navPage) === 0) {
      const newTotal = countVisitPages(totalVisits + 1);
      if (newTotal !== get(navTotal)) {
        navTotal.set(newTotal);
      }
      const currentVisitIdValue: number | null = get(currentVisitId);
      const visitEx = await api.getVisitEx(visit.visitId);
      const curVisits = get(visits);
      if (currentVisitIdValue == null) {
        currentVisitId.set(visit.visitId);
      } else {
        if (curVisits.length > 0 && curVisits[curVisits.length - 1].visitId === visit.visitId) {
          navPage.set(1);
        }
      }
      curVisits.pop();
      curVisits.unshift(visitEx);
      visits.set(curVisits);
    }
  }
});

appEvent.visitUpdated.subscribe(async visit => {
  if (visit == null) {
    return;
  }
  const newVisit: m.VisitEx = await api.getVisitEx(visit.visitId);
  const visitsValue: m.VisitEx[] = get(visits);
  let index = visitsValue.findIndex(v => v.visitId === visit.visitId);
  if (index >= 0) {
    visitsValue.splice(index, 1, newVisit);
    visits.set(visitsValue);
  }
  const mishuuListValue: m.VisitEx[] = get(mishuuList);
  index = mishuuListValue.findIndex(v => v.visitId == visit.visitId);
  if (index >= 0) {
    mishuuListValue.splice(index, 1, newVisit);
    mishuuList.set(mishuuListValue);
  }
});

appEvent.visitDeleted.subscribe(visit => {
  if (visit == null) {
    return;
  }
  console.log("visit deleted", visit);
  const visitsValue: m.VisitEx[] = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === visit.visitId);
  if (index >= 0) {
    const patient = get(currentPatient);
    if (patient !== null) {
      taskRunner.run(
        new FetchTask<number>(
          () => api.countVisitByPatient(patient.patientId),
          count => {
            const newTotal = countVisitPages(count);
            const navTotalValue = get(navTotal);
            if (navTotalValue !== newTotal) {
              let navPageValue = get(navPage);
              if (navPageValue >= newTotal) {
                navPageValue = newTotal - 1;
                if (navPageValue < 0) {
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
  if (wqueue == null) {
    return;
  }
  const currentVisitIdValue = get(currentVisitId);
  if (wqueue.visitId === currentVisitIdValue) {
    currentVisitId.set(null);
  }
})

appEvent.paymentEntered.subscribe(payment => {
  if (payment == null) {
    return;
  }
  console.log("payment entered", payment);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === payment.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    visit.lastPayment = payment;
    visits.set(visitsValue);
  }
});

appEvent.shinryouEntered.subscribe(async shinryou => {
  if (shinryou == null) {
    return;
  }
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === shinryou.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const shinryouList = visit.shinryouList;
    const i = shinryouList.findIndex(s => s.shinryoucode > shinryou.shinryoucode);
    const shinryouEx: m.ShinryouEx = await api.getShinryouEx(shinryou.shinryouId);
    if (i >= 0) {
      shinryouList.splice(i, 0, shinryouEx);
    } else {
      shinryouList.push(shinryouEx);
    }
    visits.set(visitsValue);
  }
});

appEvent.shinryouDeleted.subscribe(shinryou => {
  if (shinryou == null) {
    return;
  }
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === shinryou.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const i = visit.shinryouList.findIndex(s => s.shinryouId === shinryou.shinryouId);
    if (i >= 0) {
      visit.shinryouList.splice(i, 1);
      visits.set(visitsValue);
    }
  }
});

appEvent.conductEntered.subscribe(async conduct => {
  if (conduct == null) {
    return;
  }
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const conductEx = await api.getConductEx(conduct.conductId);
    visit.conducts.push(conductEx);
    visits.set(visitsValue);
  }
});

appEvent.conductUpdated.subscribe(async conduct => {
  if (conduct == null) {
    return;
  }
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === conduct.conductId);
    if (ci >= 0) {
      const conductEx = await api.getConductEx(conduct.conductId);
      visit.conducts[ci] = conductEx;
      visits.set(visitsValue);
    }
  }
});

appEvent.conductDeleted.subscribe(conduct => {
  if (conduct == null) {
    return;
  }
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    visit.conducts = visit.conducts.filter(c => c.conductId !== conduct.conductId);
    visits.set(visitsValue);
  }
});

appEvent.conductShinryouEntered.subscribe(async conductShinryou => {
  if (conductShinryou == null) {
    return;
  }
  const conduct = await api.getConduct(conductShinryou.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === conductShinryou.conductId);
    if (ci >= 0) {
      const conductShinryouEx = await api.getConductShinryouEx(conductShinryou.conductShinryouId);
      visit.conducts[ci].shinryouList.push(conductShinryouEx);
      visits.set(visitsValue);
    }
  }
});

appEvent.conductShinryouDeleted.subscribe(async conductShinryou => {
  if (conductShinryou == null) {
    return;
  }
  const conduct = await api.getConduct(conductShinryou.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === conductShinryou.conductId);
    if (ci >= 0) {
      const list = visit.conducts[ci].shinryouList;
      const si = list.findIndex(s => s.conductShinryouId === conductShinryou.conductShinryouId)
      if (si >= 0) {
        list.splice(si, 1);
        visits.set(visitsValue);
      }
    }
  }
});

appEvent.conductDrugEntered.subscribe(async conductDrug => {
  if (conductDrug == null) {
    return;
  }
  const conduct = await api.getConduct(conductDrug.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === conductDrug.conductId);
    if (ci >= 0) {
      const conductDrugEx = await api.getConductDrugEx(conductDrug.conductDrugId);
      console.log("conduct drug entered", conductDrugEx);
      visit.conducts[ci].drugs.push(conductDrugEx);
      visits.set(visitsValue);
    }
  }
});

appEvent.conductDrugDeleted.subscribe(async conductDrug => {
  if (conductDrug == null) {
    return;
  }
  const conduct = await api.getConduct(conductDrug.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === conductDrug.conductId);
    if (ci >= 0) {
      const list = visit.conducts[ci].drugs;
      const di = list.findIndex(d => d.conductDrugId === conductDrug.conductDrugId)
      if (di >= 0) {
        list.splice(di, 1);
        visits.set(visitsValue);
      }
    }
  }
});

appEvent.conductKizaiEntered.subscribe(async conductKizai => {
  if (conductKizai == null) {
    return;
  }
  const conduct = await api.getConduct(conductKizai.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === conductKizai.conductId);
    if (ci >= 0) {
      const conductKizaiEx = await api.getConductKizaiEx(conductKizai.conductKizaiId);
      console.log("conduct kizai entered", conductKizaiEx);
      visit.conducts[ci].kizaiList.push(conductKizaiEx);
      visits.set(visitsValue);
    }
  }
});

appEvent.conductKizaiDeleted.subscribe(async conductKizai => {
  if (conductKizai == null) {
    return;
  }
  const conduct = await api.getConduct(conductKizai.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === conductKizai.conductId);
    if (ci >= 0) {
      const list = visit.conducts[ci].kizaiList;
      const ki = list.findIndex(s => s.conductKizaiId === conductKizai.conductKizaiId)
      if (ki >= 0) {
        list.splice(ki, 1);
        visits.set(visitsValue);
      }
    }
  }
});

appEvent.gazouLabelEntered.subscribe(async gazouLabel => {
  if (gazouLabel == null) {
    return;
  }
  const conduct = await api.getConductEx(gazouLabel.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === gazouLabel.conductId);
    if (ci >= 0) {
      visit.conducts.splice(ci, 1, conduct);
      visits.set(visitsValue);
    }
  }
})

appEvent.gazouLabelUpdated.subscribe(async gazouLabel => {
  if (gazouLabel == null) {
    return;
  }
  const conduct = await api.getConductEx(gazouLabel.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === gazouLabel.conductId);
    if (ci >= 0) {
      visit.conducts.splice(ci, 1, conduct);
      visits.set(visitsValue);
    }
  }
})

appEvent.gazouLabelDeleted.subscribe(async gazouLabel => {
  if (gazouLabel == null) {
    return;
  }
  const conduct = await api.getConductEx(gazouLabel.conductId);
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === conduct.visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    const ci = visit.conducts.findIndex(c => c.conductId === gazouLabel.conductId);
    if (ci >= 0) {
      visit.conducts.splice(ci, 1, conduct);
      visits.set(visitsValue);
    }
  }
})

appEvent.chargeUpdated.subscribe(charge => {
  if (charge == null) {
    return;
  }
  const visitId = charge.visitId;
  const visitsValue = get(visits);
  const index = visitsValue.findIndex(v => v.visitId === visitId);
  if (index >= 0) {
    const visit = visitsValue[index];
    visit.chargeOption = charge;
    visits.set(visitsValue);
  }
})


