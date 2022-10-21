import { tick } from "svelte"

export function setFocus(e: HTMLInputElement): void {
  tick().then(_ => {
    e.focus();
  });
}

