<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import { nenPulldown } from "./nen-pulldown";
  import { nameToGengou, nenRangeOfGengou } from "myclinic-util";

  export let nen: number;
  export let gengou: string;
  // let anchor: HTMLElement;
  export let onChange: (nen: number) => void;

  let selected: Writable<number> = writable(nen);
  selected.subscribe(onChange);

  function calcNenList(): number[] {
    // let g = kanjidate.Gengou.fromString(gengou);
    let g = nameToGengou(gengou);
    if (g != null) {
      let nenLast = nenRangeOfGengou(g)[1];
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
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span on:click={nenPulldown(calcNenList, () => nen, onChange)}>{nen}</span><span>年</span>
    <!-- <NenPulldown slot="menu" {destroy} {nen} nenList={calcNenList()} {onChange}/> -->
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    min-width: 2.3rem;
    text-align: right;
  }
</style>
