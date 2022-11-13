import api, { wsUrl } from "../lib/api"
import type * as m from "myclinic-model"
import { writable, type Writable } from "svelte/store"

let nextEventId = 0;
let isDraining = false;
let eventQueue: m.AppEvent[] = [];
let heartBeatSerialId = 0;

export async function initAppEvents() {
  nextEventId = await api.getNextAppEventId();
  connect();
}

function connect(): void {
  let ws = new WebSocket(wsUrl);

  ws.addEventListener("open", () => {
    console.log("ws open");
  })

  ws.addEventListener("message", event => {
    console.log(event.data);
    const data = event.data;
    if (typeof data === "string") {
      const json = JSON.parse(data);
      dispatch(json);
    }
  })

  ws.addEventListener("close", () => {
    console.log("ws close");
    setTimeout(() => {
      connect()
    }, 1000);
  })

  ws.addEventListener("error", () => {
    console.log("ws error");
    ws.close();
  })
}

async function drainEvents() {
  isDraining = true;
  console.log("start drain");
  let events = await api.listAppEventSince(nextEventId);
  events.forEach(event => {
    if( event.appEventId >= nextEventId ){
      nextEventId = event.appEventId + 1;
      publishAppEvent(event);
    }
  });
  isDraining = false;
  console.log("end drain");
  while( eventQueue.length > 0 ){
    const e = eventQueue.shift();
    handleAppEvent(e);
  }
}

export const textEntered: Writable<m.Text | null> = writable(null)
export const textUpdated: Writable<m.Text | null> = writable(null)
export const textDeleted: Writable<m.Text | null> = writable(null)
export const visitEntered: Writable<m.Visit | null> = writable(null)
export const visitUpdated: Writable<m.Visit | null> = writable(null)
export const visitDeleted: Writable<m.Visit | null> = writable(null)
export const wqueueEntered: Writable<m.Wqueue | null> = writable(null)
export const wqueueUpdated: Writable<m.Wqueue | null> = writable(null)
export const wqueueDeleted: Writable<m.Wqueue | null> = writable(null)
export const paymentEntered: Writable<m.Payment | null> = writable(null)
export const paymentUpdated: Writable<m.Payment | null> = writable(null)
export const paymentDeleted: Writable<m.Payment | null> = writable(null)
export const shinryouEntered: Writable<m.Shinryou | null> = writable(null)
export const shinryouUpdated: Writable<m.Shinryou | null> = writable(null)
export const shinryouDeleted: Writable<m.Shinryou | null> = writable(null)
export const conductEntered: Writable<m.Conduct | null> = writable(null)
export const conductUpdated: Writable<m.Conduct | null> = writable(null)
export const conductDeleted: Writable<m.Conduct | null> = writable(null)
export const conductShinryouEntered: Writable<m.ConductShinryou | null> = writable(null)
export const conductShinryouUpdated: Writable<m.ConductShinryou | null> = writable(null)
export const conductShinryouDeleted: Writable<m.ConductShinryou | null> = writable(null)
export const conductDrugEntered: Writable<m.ConductDrug | null> = writable(null)
export const conductDrugUpdated: Writable<m.ConductDrug | null> = writable(null)
export const conductDrugDeleted: Writable<m.ConductDrug | null> = writable(null)
export const conductKizaiEntered: Writable<m.ConductKizai | null> = writable(null)
export const conductKizaiUpdated: Writable<m.ConductKizai | null> = writable(null)
export const conductKizaiDeleted: Writable<m.ConductKizai | null> = writable(null)
export const gazouLabelEntered: Writable<m.GazouLabel | null> = writable(null)
export const gazouLabelUpdated: Writable<m.GazouLabel | null> = writable(null)
export const gazouLabelDeleted: Writable<m.GazouLabel | null> = writable(null)
export const chargeEntered: Writable<m.Charge | null> = writable(null)
export const chargeUpdated: Writable<m.Charge | null> = writable(null)
export const chargeDeleted: Writable<m.Charge | null> = writable(null)
export const diseaseEntered: Writable<m.Disease | null> = writable(null)
export const diseaseUpdated: Writable<m.Disease | null> = writable(null)
export const diseaseDeleted: Writable<m.Disease | null> = writable(null)
export const diseaseAdjEntered: Writable<m.DiseaseAdj | null> = writable(null)
export const diseaseAdjUpdated: Writable<m.DiseaseAdj | null> = writable(null)
export const diseaseAdjDeleted: Writable<m.DiseaseAdj | null> = writable(null)
export const hotlineEntered: Writable<m.HotlineEx | null> = writable(null)
export const hotlineBeepEntered: Writable<m.HotlineBeep | null> = writable(null);
export const eventIdNoticeEntered: Writable<m.EventIdNotice | null> = writable(null);
export const heartBeatEntered: Writable<m.HeartBeat | null> = writable(null);


function handleAppEvent(e: m.AppEvent): void {
  if( isDraining ){
    eventQueue.push(e);
  } else {
    const eventId = e.appEventId;
    if( eventId === nextEventId ){
      nextEventId = eventId + 1;
      publishAppEvent(e);
    } else if( eventId > nextEventId ){
      drainEvents();
    }
  }
}

function publishAppEvent(e: m.AppEvent): void {
  console.log(e);
  const model: string = e.model;
  const kind: string = e.kind;
  const payload = JSON.parse(e.data);
  console.log("event kind", kind);
  switch (model) {
    case "text": {
      switch (kind) {
        case "created": {
          textEntered.set(payload);
          break;
        }
        case "updated": {
          textUpdated.set(payload);
          break;
        }
        case "deleted": {
          textDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "visit": {
      switch (kind) {
        case "created": {
          visitEntered.set(payload);
          break;
        }
        case "updated": {
          visitUpdated.set(payload);
          break;
        }
        case "deleted": {
          visitDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "wqueue": {
      switch (kind) {
        case "created": {
          wqueueEntered.set(payload);
          break;
        }
        case "updated": {
          wqueueUpdated.set(payload);
          break;
        }
        case "deleted": {
          wqueueDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "payment": {
      switch (kind) {
        case "created": {
          paymentEntered.set(payload);
          break;
        }
        case "updated": {
          paymentUpdated.set(payload);
          break;
        }
        case "deleted": {
          paymentDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "shinryou": {
      switch (kind) {
        case "created": {
          shinryouEntered.set(payload);
          break;
        }
        case "updated": {
          shinryouUpdated.set(payload);
          break;
        }
        case "deleted": {
          shinryouDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "conduct": {
      switch (kind) {
        case "created": {
          conductEntered.set(payload);
          break;
        }
        case "updated": {
          conductUpdated.set(payload);
          break;
        }
        case "deleted": {
          conductDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "conductShinryou": {
      switch (kind) {
        case "created": {
          conductShinryouEntered.set(payload);
          break;
        }
        case "updated": {
          conductShinryouUpdated.set(payload);
          break;
        }
        case "deleted": {
          conductShinryouDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "conductDrug": {
      switch (kind) {
        case "created": {
          conductDrugEntered.set(payload);
          break;
        }
        case "updated": {
          conductDrugUpdated.set(payload);
          break;
        }
        case "deleted": {
          conductDrugDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "conductKizai": {
      switch (kind) {
        case "created": {
          conductKizaiEntered.set(payload);
          break;
        }
        case "updated": {
          conductKizaiUpdated.set(payload);
          break;
        }
        case "deleted": {
          conductKizaiDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "gazouLabel": {
      switch (kind) {
        case "created": {
          gazouLabelEntered.set(payload);
          break;
        }
        case "updated": {
          gazouLabelUpdated.set(payload);
          break;
        }
        case "deleted": {
          gazouLabelDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "charge": {
      switch (kind) {
        case "created": {
          chargeEntered.set(payload);
          break;
        }
        case "updated": {
          chargeUpdated.set(payload);
          break;
        }
        case "deleted": {
          chargeDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "disease": {
      switch (kind) {
        case "created": {
          diseaseEntered.set(payload);
          break;
        }
        case "updated": {
          diseaseUpdated.set(payload);
          break;
        }
        case "deleted": {
          diseaseDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "diseaseAdj": {
      switch (kind) {
        case "created": {
          diseaseAdjEntered.set(payload);
          break;
        }
        case "updated": {
          diseaseAdjUpdated.set(payload);
          break;
        }
        case "deleted": {
          diseaseAdjDeleted.set(payload);
          break;
        }
      }
      break;
    }
    case "hotline": {
      switch (kind) {
        case "created": {
          console.log("hotline created", payload)
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
  console.log("dispatch", e);
  if (e.format === "appevent") {
    handleAppEvent(e.data as m.AppEvent);
  } else if (e.format === "hotline-beep") {
    const hotlineBeep = e.data as m.HotlineBeep;
    hotlineBeepEntered.set(hotlineBeep);
  } else if (e.format === "event-id-notice") {
    const eventIdNotice = e.data;
    eventIdNoticeEntered.set(eventIdNotice);
  } else if (e.format === "heart-beat") {
    const heartBeat = { heartBeatSerialId: ++heartBeatSerialId };
    heartBeatEntered.set(heartBeat);
  }
}
