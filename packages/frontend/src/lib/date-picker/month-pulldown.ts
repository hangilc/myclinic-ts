import type { Writable } from "svelte/store"
import MonthPulldown from "./MonthPulldown.svelte"

export function monthPulldown(month: () => number, onChange: (m: number) => void): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const d: MonthPulldown = new MonthPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        event,
        onChange,
        month: month(),
      }
    })
  }
}