<script lang="ts">
  import * as kanjidate from "kanjidate";
  import PulldownMenu from "../PulldownMenu.svelte";
  import { range_from_one_upto } from "../range";
  import DayPartPulldown from "./DayPartPulldown.svelte";

  export let day: number;
  export let gengou: string;
  export let nen: number;
  export let month: number;
  export let onChange: (day: number) => void;
  let anchor: HTMLElement;

  function calcDayList(): number[] {
    let year = kanjidate.fromGengou(gengou, nen);
    let lastDay: number = kanjidate.lastDayOfMonth(year, month);
    return range_from_one_upto(lastDay);
  }

  // function doClick(): void {
  //   let year = kanjidate.fromGengou(gengou, nen);
  //   let lastDay: number = kanjidate.lastDayOfMonth(year, month);
  //   let dayList: number[] = range_from_one_upto(lastDay);
  //   const d: DayPartPulldown = new DayPartPulldown({
  //     target: document.body,
  //     props: {
  //       destroy: () => d.$destroy(),
  //       anchor,
  //       dayList,
  //       day,
  //       onChange,
  //     },
  //   });
  // }
</script>

<span class="top">
  <PulldownMenu let:destroy let:triggerClick>
    <span on:click={triggerClick} bind:this={anchor}>{day}</span><span>日</span>
    <DayPartPulldown slot="menu" {destroy} dayList={calcDayList()} {day} {onChange}/>
  </PulldownMenu>
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    min-width: 2.3rem;
    text-align: right;
  }
</style>
