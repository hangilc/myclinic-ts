<script lang="ts">
  import * as kanjidate from "kanjidate";
  import Popup from "../Popup.svelte";
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

</script>

<span class="top">
  <Popup let:destroy let:triggerClick>
    <span on:click={triggerClick} bind:this={anchor}>{day}</span><span>日</span>
    <DayPartPulldown slot="menu" {destroy} dayList={calcDayList()} {day} {onChange}/>
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
