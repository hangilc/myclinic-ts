import api, { getWsUrl } from "./lib/api";
import * as m from "myclinic-model";
import { writable, type Writable } from "svelte/store";

let nextEventId = 0;
let isDraining = false;
let eventQueue: m.AppEvent[] = [];
let heartBeatSerialId = 0;
let debug = false;

function log(...msgs: any[]): void {
  if (debug) {
    console.log(...msgs);
  }
}

export async function initAppEvents() {
  log("initializing AppEvents");
  nextEventId = await api.getNextAppEventId();
  log("got nextEventId", nextEventId);
  connect();
}

function connect(): void {
  let ws = new WebSocket(getWsUrl());

  ws.addEventListener("open", () => {
    log("ws open");
  });

  ws.addEventListener("message", (event) => {
    const data = event.data;
    log("got ws message", data);
    if (typeof data === "string") {
      const json = JSON.parse(data);
      // if (json.format !== "heart-beat") {
      //   console.log(json);
      // }
      dispatch(json);
    }
  });

  ws.addEventListener("close", () => {
    console.log("ws close");
    setTimeout(() => {
      connect();
    }, 1000);
  });

  ws.addEventListener("error", () => {
    console.log("ws error");
    ws.close();
  });
}

async function drainEvents() {
  if (isDraining) {
    return;
  }
  isDraining = true;
  console.log("start drain");
  let events = await api.listAppEventSince(nextEventId);
  events.forEach((event) => {
    if (event.appEventId >= nextEventId) {
      nextEventId = event.appEventId + 1;
      publishAppEvent(event);
    }
  });
  isDraining = false;
  console.log("end drain");
  while (eventQueue.length > 0) {
    const e = eventQueue.shift() as m.AppEvent;
    handleAppEvent(e);
  }
}

export const textEntered: Writable<m.Text | null> = writable(null);
export const textUpdated: Writable<m.Text | null> = writable(null);
export const textDeleted: Writable<m.Text | null> = writable(null);
export const patientEntered: Writable<m.Patient | null> = writable(null);
export const patientUpdated: Writable<m.Patient | null> = writable(null);
export const patientDeleted: Writable<m.Patient | null> = writable(null);
export const visitEntered: Writable<m.Visit | null> = writable(null);
export const visitUpdated: Writable<m.Visit | null> = writable(null);
export const visitDeleted: Writable<m.Visit | null> = writable(null);
export const wqueueEntered: Writable<m.Wqueue | null> = writable(null);
export const wqueueUpdated: Writable<m.Wqueue | null> = writable(null);
export const wqueueDeleted: Writable<m.Wqueue | null> = writable(null);
export const paymentEntered: Writable<m.Payment | null> = writable(null);
export const paymentUpdated: Writable<m.Payment | null> = writable(null);
export const paymentDeleted: Writable<m.Payment | null> = writable(null);
export const shinryouEntered: Writable<m.Shinryou | null> = writable(null);
export const shinryouUpdated: Writable<m.Shinryou | null> = writable(null);
export const shinryouDeleted: Writable<m.Shinryou | null> = writable(null);
export const conductEntered: Writable<m.Conduct | null> = writable(null);
export const conductUpdated: Writable<m.Conduct | null> = writable(null);
export const conductDeleted: Writable<m.Conduct | null> = writable(null);
export const conductShinryouEntered: Writable<m.ConductShinryou | null> =
  writable(null);
export const conductShinryouUpdated: Writable<m.ConductShinryou | null> =
  writable(null);
export const conductShinryouDeleted: Writable<m.ConductShinryou | null> =
  writable(null);
export const conductDrugEntered: Writable<m.ConductDrug | null> =
  writable(null);
export const conductDrugUpdated: Writable<m.ConductDrug | null> =
  writable(null);
export const conductDrugDeleted: Writable<m.ConductDrug | null> =
  writable(null);
export const conductKizaiEntered: Writable<m.ConductKizai | null> =
  writable(null);
export const conductKizaiUpdated: Writable<m.ConductKizai | null> =
  writable(null);
export const conductKizaiDeleted: Writable<m.ConductKizai | null> =
  writable(null);
export const gazouLabelEntered: Writable<m.GazouLabel | null> = writable(null);
export const gazouLabelUpdated: Writable<m.GazouLabel | null> = writable(null);
export const gazouLabelDeleted: Writable<m.GazouLabel | null> = writable(null);
export const chargeEntered: Writable<m.Charge | null> = writable(null);
export const chargeUpdated: Writable<m.Charge | null> = writable(null);
export const chargeDeleted: Writable<m.Charge | null> = writable(null);
export const diseaseEntered: Writable<m.Disease | null> = writable(null);
export const diseaseUpdated: Writable<m.Disease | null> = writable(null);
export const diseaseDeleted: Writable<m.Disease | null> = writable(null);
export const diseaseAdjEntered: Writable<m.DiseaseAdj | null> = writable(null);
export const diseaseAdjUpdated: Writable<m.DiseaseAdj | null> = writable(null);
export const diseaseAdjDeleted: Writable<m.DiseaseAdj | null> = writable(null);
export const shahokokuhoEntered: Writable<m.Shahokokuho | null> =
  writable(null);
export const shahokokuhoUpdated: Writable<m.Shahokokuho | null> =
  writable(null);
export const shahokokuhoDeleted: Writable<m.Shahokokuho | null> =
  writable(null);
export const koukikoureiEntered: Writable<m.Koukikourei | null> =
  writable(null);
export const koukikoureiUpdated: Writable<m.Koukikourei | null> =
  writable(null);
export const koukikoureiDeleted: Writable<m.Koukikourei | null> =
  writable(null);
export const kouhiEntered: Writable<m.Kouhi | null> = writable(null);
export const kouhiUpdated: Writable<m.Kouhi | null> = writable(null);
export const kouhiDeleted: Writable<m.Kouhi | null> = writable(null);
export const appointEntered: Writable<m.Appoint | null> = writable(null);
export const appointUpdated: Writable<m.Appoint | null> = writable(null);
export const appointDeleted: Writable<m.Appoint | null> = writable(null);
export const appointTimeEntered: Writable<m.AppointTime | null> =
  writable(null);
export const appointTimeUpdated: Writable<m.AppointTime | null> =
  writable(null);
export const appointTimeDeleted: Writable<m.AppointTime | null> =
  writable(null);
export const onshiEntered: Writable<m.Onshi | null> = writable(null);
export const onshiUpdated: Writable<m.Onshi | null> = writable(null);
export const onshiDeleted: Writable<m.Onshi | null> = writable(null);

export const hotlineEntered: Writable<m.HotlineEx | null> = writable(null);
export const hotlineBeepEntered: Writable<m.HotlineBeep | null> =
  writable(null);
export const eventIdNoticeEntered: Writable<m.EventIdNotice | null> =
  writable(null);
export const heartBeatEntered: Writable<m.HeartBeat | null> = writable(null);

export const windowResized: Writable<UIEvent | undefined> = writable(undefined);

function handleAppEvent(e: m.AppEvent): void {
  if (isDraining) {
    eventQueue.push(e);
  } else {
    const eventId = e.appEventId;
    if (eventId === nextEventId) {
      nextEventId = eventId + 1;
      publishAppEvent(e);
    } else if (eventId > nextEventId) {
      drainEvents();
    }
  }
}

function publishAppEvent(e: m.AppEvent): void {
  const model: string = e.model;
  const kind: string = e.kind;
  const payload = JSON.parse(e.data);
  console.log(e);
  switch (model) {
    case "text": {
      const model = m.Text.cast(payload);
      switch (kind) {
        case "created": {
          textEntered.set(model);
          break;
        }
        case "updated": {
          textUpdated.set(model);
          break;
        }
        case "deleted": {
          textDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "patient": {
      const model = m.Patient.cast(payload);
      switch (kind) {
        case "created": {
          patientEntered.set(model);
          break;
        }
        case "updated": {
          patientUpdated.set(model);
          break;
        }
        case "deleted": {
          patientDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "visit": {
      const model = m.Visit.cast(payload);
      switch (kind) {
        case "created": {
          visitEntered.set(model);
          break;
        }
        case "updated": {
          visitUpdated.set(model);
          break;
        }
        case "deleted": {
          visitDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "wqueue": {
      const model = m.Wqueue.cast(payload);
      switch (kind) {
        case "created": {
          wqueueEntered.set(model);
          break;
        }
        case "updated": {
          wqueueUpdated.set(model);
          break;
        }
        case "deleted": {
          wqueueDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "payment": {
      const model = m.Payment.cast(payload);
      switch (kind) {
        case "created": {
          paymentEntered.set(model);
          break;
        }
        case "updated": {
          paymentUpdated.set(model);
          break;
        }
        case "deleted": {
          paymentDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "shinryou": {
      const model = m.Shinryou.cast(payload);
      switch (kind) {
        case "created": {
          shinryouEntered.set(model);
          break;
        }
        case "updated": {
          shinryouUpdated.set(model);
          break;
        }
        case "deleted": {
          shinryouDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "conduct": {
      const model = m.Conduct.cast(payload);
      switch (kind) {
        case "created": {
          conductEntered.set(model);
          break;
        }
        case "updated": {
          conductUpdated.set(model);
          break;
        }
        case "deleted": {
          conductDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "conductShinryou": {
      const model = m.ConductShinryou.cast(payload);
      switch (kind) {
        case "created": {
          conductShinryouEntered.set(model);
          break;
        }
        case "updated": {
          conductShinryouUpdated.set(model);
          break;
        }
        case "deleted": {
          conductShinryouDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "conductDrug": {
      const model = m.ConductDrug.cast(payload);
      switch (kind) {
        case "created": {
          conductDrugEntered.set(model);
          break;
        }
        case "updated": {
          conductDrugUpdated.set(model);
          break;
        }
        case "deleted": {
          conductDrugDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "conductKizai": {
      const model = m.ConductKizai.cast(payload);
      switch (kind) {
        case "created": {
          conductKizaiEntered.set(model);
          break;
        }
        case "updated": {
          conductKizaiUpdated.set(model);
          break;
        }
        case "deleted": {
          conductKizaiDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "gazouLabel": {
      const model = m.GazouLabel.cast(payload);
      switch (kind) {
        case "created": {
          gazouLabelEntered.set(model);
          break;
        }
        case "updated": {
          gazouLabelUpdated.set(model);
          break;
        }
        case "deleted": {
          gazouLabelDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "charge": {
      const model = m.Charge.cast(payload);
      switch (kind) {
        case "created": {
          chargeEntered.set(model);
          break;
        }
        case "updated": {
          chargeUpdated.set(model);
          break;
        }
        case "deleted": {
          chargeDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "disease": {
      const model = m.Disease.cast(payload);
      switch (kind) {
        case "created": {
          diseaseEntered.set(model);
          break;
        }
        case "updated": {
          diseaseUpdated.set(model);
          break;
        }
        case "deleted": {
          diseaseDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "diseaseAdj": {
      const model = m.DiseaseAdj.cast(payload);
      switch (kind) {
        case "created": {
          diseaseAdjEntered.set(model);
          break;
        }
        case "updated": {
          diseaseAdjUpdated.set(model);
          break;
        }
        case "deleted": {
          diseaseAdjDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "shahokokuho": {
      const model = m.Shahokokuho.cast(payload);
      switch (kind) {
        case "created": {
          shahokokuhoEntered.set(model);
          break;
        }
        case "updated": {
          shahokokuhoUpdated.set(model);
          break;
        }
        case "deleted": {
          shahokokuhoDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "koukikourei": {
      const model = m.Koukikourei.cast(payload);
      switch (kind) {
        case "created": {
          koukikoureiEntered.set(model);
          break;
        }
        case "updated": {
          koukikoureiUpdated.set(model);
          break;
        }
        case "deleted": {
          koukikoureiDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "kouhi": {
      const model = m.Kouhi.cast(payload);
      switch (kind) {
        case "created": {
          kouhiEntered.set(model);
          break;
        }
        case "updated": {
          kouhiUpdated.set(model);
          break;
        }
        case "deleted": {
          kouhiDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "appoint": {
      const model = m.Appoint.cast(payload);
      switch (kind) {
        case "created": {
          console.log("appevent appoint created", model);
          appointEntered.set(model);
          break;
        }
        case "updated": {
          appointUpdated.set(model);
          break;
        }
        case "deleted": {
          appointDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "appoint-time": {
      const model = m.AppointTime.cast(payload);
      switch (kind) {
        case "created": {
          appointTimeEntered.set(model);
          break;
        }
        case "updated": {
          appointTimeUpdated.set(model);
          break;
        }
        case "deleted": {
          appointTimeDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "onshi": {
      const model = m.Onshi.cast(payload);
      switch (kind) {
        case "created": {
          console.log("appevent onshi created", model);
          onshiEntered.set(model);
          break;
        }
        case "updated": {
          onshiUpdated.set(model);
          break;
        }
        case "deleted": {
          onshiDeleted.set(model);
          break;
        }
      }
      break;
    }
    case "hotline": {
      switch (kind) {
        case "created": {
          console.log("hotline created", payload);
          const appEventId: number = e.appEventId;
          hotlineEntered.set({ appEventId, ...payload });
          break;
        }
      }
      break;
    }
  }
}

function dispatch(e: any): void {
  // console.log("dispatch", e);
  if (e.format === "appevent") {
    handleAppEvent(e.data as m.AppEvent);
  } else if (e.format === "hotline-beep") {
    const hotlineBeep = e.data as m.HotlineBeep;
    hotlineBeepEntered.set(hotlineBeep);
  } else if (e.format === "event-id-notice") {
    const eventIdNotice = e.data;
    const eventId = eventIdNotice.currentEventId
    log("event-id-notice currentEventId", eventId);
    if (eventId >= nextEventId) {
      drainEvents();
    }
    eventIdNoticeEntered.set(eventIdNotice);
  } else if (e.format === "heart-beat") {
    const heartBeat = { heartBeatSerialId: ++heartBeatSerialId };
    heartBeatEntered.set(heartBeat);
  }
}
