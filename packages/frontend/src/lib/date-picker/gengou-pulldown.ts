  import type { Writable } from "svelte/store";
import GengouPulldown from "./GengouPulldown.svelte";
  import * as kanjidate from "kanjidate";

type Opt = {
  gengouList?: string[]
}

function defaultGengouList(): string[] {
  return kanjidate.GengouList.map(g => g.kanji);
}

export function gengouPulldown(selected: Writable<string>, opt: Opt = {}): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const d: GengouPulldown = new GengouPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        event,
        gengouList: opt.gengouList || defaultGengouList(),
        selected,
      }
    })
  };
}
