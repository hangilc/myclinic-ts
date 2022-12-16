<script lang="ts">
  import * as kanjidate from "kanjidate";
  import { range_from_one_upto } from "../range";
  import DayPartPulldown from "./DayPartPulldown.svelte";

  export let day: number;
  export let gengou: string;
  export let nen: number;
  export let month: number;
  export let onChange: (day: number) => void;
  let anchor: HTMLElement;

  function doClick(): void {
    let year = kanjidate.fromGengou(gengou, nen);
    let lastDay: number = kanjidate.lastDayOfMonth(year, month);
    let dayList: number[] = range_from_one_upto(lastDay);
    const d: DayPartPulldown = new DayPartPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor,
        dayList,
        day,
        onChange,
      },
    });
  }
</script>

<span class="top">
  <span on:click={doClick} bind:this={anchor}>{day}</span><span>日</span>
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    min-width: 2.3rem;
    text-align: right;
  }
</style>
