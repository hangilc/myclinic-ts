import { textEntered } from "@/app-events";
import { isShohousen } from "@/lib/shohousen/parse-shohousen";
import { TextMemoWrapper } from "@/lib/text-memo";
import { writable, type Writable } from "svelte/store";

const pending: Record<number, boolean> = {};

let serialId = 0;
export const shohouPrintChanged: Writable<number> = writable(serialId);

function broadcast() {
  shohouPrintChanged.set(++serialId);
}

textEntered.subscribe(text => {
  if( !text ){
    return;
  }
  if( isShohousen(text.content) ){
    pending[text.textId] = true;
    broadcast();
    return;
  }
  if( !text.memo ){
    return;
  }
  const m = TextMemoWrapper.fromText(text);
  if( m.getMemoKind() === "shohou" ){
    pending[text.textId] = true;
    broadcast();
  }
})

export function shohouPrinted(textId: number) {
  delete pending[textId];
  broadcast();
}

export function isShohouPrintPending(textId: number): boolean {
  return pending[textId] ?? false;
}
