import { wsUrl } from "../lib/api"
import type * as m from "@/lib/model"
import { writable, type Writable } from "svelte/store"

export function initAppEvents(): void{
  let ws = new WebSocket(wsUrl);
  
  ws.addEventListener("message", event => {
    const data = event.data;
    if( typeof data === "string" ){
      const json = JSON.parse(data);
      dispatch(json);
    }
  })
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

function dispatch(e: any): void {
  if( e.format === "appevent" ){
    console.log(e);
    const data = e.data;
    const model: string = data.model;
    const kind: string = data.kind;
    const payload = JSON.parse(data.data);
    switch(model){
      case "text": {
        switch(kind) {
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
        switch(kind) {
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
        switch(kind) {
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
        switch(kind) {
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
        switch(kind) {
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
        switch(kind) {
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
        switch(kind) {
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
        switch(kind) {
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
        switch(kind) {
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
        switch(kind) {
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
    }
  }
}