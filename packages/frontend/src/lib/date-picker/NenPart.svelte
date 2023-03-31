<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import * as kanjidate from "kanjidate";
  import NenPulldown from "./NenPulldown.svelte";
  import Popup from "../Popup.svelte";

  export let nen: number;
  export let gengou: string;
  // let anchor: HTMLElement;
  export let onChange: (nen: number) => void;

  let selected: Writable<number> = writable(nen);
  selected.subscribe(onChange);

  function calcNenList(): number[] {
    let g = kanjidate.Gengou.fromString(gengou);
    if (g != null) {
      let nenLast = kanjidate.nenRangeOf(g)[1];
      return range(nenLast);
    } else {
      return [];
    }
  }

  function range(n: number): number[] {
    return Array.from(new Array(n), (_, i) => i + 1);
  }
</script>

<span class="top">
  <Popup let:destroy let:trigger>
    <span on:click={trigger}>{nen}</span><span>年</span>
    <NenPulldown slot="menu" {destroy} {nen} nenList={calcNenList()} {onChange}/>
  </Popup>
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    min-width: 2.3rem;
    text-align: right;
  }
</style>
