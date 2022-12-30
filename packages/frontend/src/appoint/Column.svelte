<script lang="ts">
  import type { ColumnData } from "./column-data";
  import * as kanjidate from "kanjidate";
  import AppointTimeBlock from "./AppointTimeBlock.svelte";

  export let data: ColumnData;
  const dateFormat = "{M}月{D}日（{W}）";
</script>

<div class="top">
  <div class={`date ${data.op.code}`}>
    {kanjidate.format(dateFormat, data.date)}
    <div class="date-label">{data.op.name ?? ""}</div>
  </div>
  {#each data.appointTimes as at (at.appointTime.fromTime)}
    <AppointTimeBlock data={at} siblings={data.appointTimes}/>
  {/each}
</div>

<style>
  .top {
    width: 160px;
  }

  .date {
    background-color: white;
    font-weight: bold;
    border-radius: 6px;
    border: 1px solid gray;
    padding: 4px;
    margin-bottom: 10px;
  }

  .date.national-holiday,
  .date.ad-hoc-holiday {
    border-color: red;
  }

  .date.national-holiday .date-label,
  .date.ad-hoc-holiday .date-label {
    color: red;
  }


</style>
