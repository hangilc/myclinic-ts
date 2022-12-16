<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import * as kanjidate from "kanjidate";
  import NenPulldown from "./NenPulldown.svelte";

  export let nen: number;
  export let gengou: string;
  let anchor: HTMLElement;
  export let onChange: (nen: number) => void;

  let selected: Writable<number> = writable(nen);
  selected.subscribe(onChange);

  function doClick(): void {
    let g = kanjidate.Gengou.fromString(gengou);
    if (g != null) {
      let nenLast = kanjidate.nenRangeOf(g)[1];
      let nenList: number[] = range(nenLast);
      const d: NenPulldown = new NenPulldown({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          anchor,
          onChange,
          nenList,
          nen,
        }
      })
    }
  }

  function range(n: number): number[] {
    return Array.from(new Array(n), (_, i) => i + 1);
  }
</script>

<span class="top" bind:this={anchor}>
  <span on:click={doClick}>{nen}</span><span>年</span>
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    width: 2.2rem;
    text-align: right;
  }
</style>
