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
    }
  }
}