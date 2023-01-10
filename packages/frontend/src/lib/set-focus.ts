import { tick } from "svelte"

export function setFocus(e: HTMLInputElement | HTMLTextAreaElement): void {
  tick().then(_ => {
    e.focus();
  });
}

