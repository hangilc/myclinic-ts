<script lang="ts">
  import * as kanjidate from "kanjidate";
  import { range_from_one_upto } from "../range";
  import DayPartPulldown from "./DayPartPulldown.svelte";
  import { dayPartPulldown } from "./day-part-pulldown";

  export let day: number;
  export let gengou: string;
  export let nen: number;
  export let month: number;
  export let onChange: (day: number) => void;
  // let anchor: HTMLElement;

  function calcDayList(): number[] {
    let year = kanjidate.fromGengou(gengou, nen);
    let lastDay: number = kanjidate.lastDayOfMonth(year, month);
    return range_from_one_upto(lastDay);
  }

</script>

<span class="top">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span on:click={dayPartPulldown(calcDayList(), day, onChange)}>{day}</span><span>日</span>
    <!-- <DayPartPulldown slot="menu" {destroy} dayList={calcDayList()} {day} {onChange}/> -->
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    min-width: 2.3rem;
    text-align: right;
  }
</style>
