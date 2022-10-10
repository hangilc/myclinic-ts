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

export const textEntered: Writable<m.Text> = writable()
export const textUpdated: Writable<m.Text> = writable()
export const textDeleted: Writable<m.Text> = writable()

function dispatch(e: any): void {
  console.log("event", e);
  if( e.format === "appevent" ){
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
      }
    }
  }
}