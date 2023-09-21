import type { Writable } from "svelte/store"
import GengouPulldown from "./GengouPulldown.svelte"

type Opt = {
  gengouList?: () => string[]
}

export function gengouPulldown(selected: Writable<string>, opt: Opt = {}): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const d: GengouPulldown = new GengouPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        event,
        selected,
        gengouList: opt.gengouList ? opt.gengouList() : undefined,
      }
    })
  }
}