<script lang="ts">

  import * as kanjidate from "kanjidate";
  import { range_from_one_upto } from "../range";
  import DayPartPulldown from "./DayPartPulldown.svelte";

  export let day: number;
  export let gengou: string;
  export let nen: number;
  export let month: number;
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
      }
    })
  }

</script>

<span class="top">
  <span on:click={doClick} bind:this={anchor}>{day}</span><span>日</span>
</span>