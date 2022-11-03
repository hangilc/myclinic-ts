<script lang="ts">
  import { type DiseaseData, fullName, startDateRep, getStartDate } from "./types";
  import { genid } from "@/lib/genid"
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { addDays } from "kanjidate";
  import * as kanjidate from "kanjidate";
  import type { DiseaseEndReasonType } from "@/lib/model";
  import { DiseaseEndReason } from "@/lib/model";
    import api from "@/lib/api";

  export let current: DiseaseData[];
  let selected: DiseaseData[] = [];
  let endDate: Date = new Date();
  let dateForm: DateFormWithCalendar;
  let endReasons: DiseaseEndReasonType[] = [
    DiseaseEndReason.Cured,
    DiseaseEndReason.Stopped,
    DiseaseEndReason.Dead,
  ];
  let endReason: DiseaseEndReasonType = DiseaseEndReason.Cured;

  $: updateEndDate(selected);

  function updateEndDate(list: DiseaseData[]): void {
    let e: string | null = null;
    list.forEach(d => {
      const s: string = getStartDate(d);
      if( e == null || s > e ){
        e = s;
      }
    })
    if( e == null ){
      endDate = new Date();
    } else {
      endDate = new Date(e);
    }
  }

  function doWeekClick(event: MouseEvent): void {
    const n = event.shiftKey ? -7 : 7;
    endDate = addDays(endDate, n);
  }

  function doTodayClick(): void {
    endDate = new Date();
  }

  function doEndOfMonthClick(): void {
    const lastDay = kanjidate.lastDayOfMonth(endDate.getFullYear(), endDate.getMonth() + 1);
    const d = new Date(endDate);
    d.setDate(lastDay);
    endDate = d;
  }

  function doEndOfLastMonthClick(): void {
    const d = new Date(endDate);
    d.setDate(0);
    endDate = d;
  }

  async function doEnter() {
    const diseaseIds: number[] = selected.map(d => d[0].diseaseId);
    const reasonCode = endReason.code;
    const promises = diseaseIds.map(diseaseId => 
      api.endDisease(diseaseId, endDate, reasonCode)
    );
    await Promise.all(promises);
  }
</script>

<div>
  {#each current as d}
  {@const id=genid()}
  <div>
    <input type="checkbox" id={id} bind:group={selected} value={d}/> 
    <label for={id}>{fullName(d)} ({startDateRep(d)})</label>
  </div>
  {/each}
  <div class="date-wrapper">
    <DateFormWithCalendar bind:date={endDate} iconWidth="18px" bind:this={dateForm}>
      <span slot="spacer" style:width="6px"/>
    </DateFormWithCalendar>
  </div>
  <div class="date-manip">
    <a href="javascript:void(0)" on:click={doWeekClick}>週</a>
    <a href="javascript:void(0)" on:click={doTodayClick}>今日</a>
    <a href="javascript:void(0)" on:click={doEndOfMonthClick}>月末</a>
    <a href="javascript:void(0)" on:click={doEndOfLastMonthClick}>先月末</a>
  </div>
  <div class="tenki">
    {#each endReasons as reason}
    {@const id=genid()}
    <input type="radio" bind:group={endReason} value={reason} id={id} />
    <label for={id}>{reason.label}</label>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
  </div>
</div>

<style>
  .date-wrapper {
    font-size: 13px;
    margin-top: 10px;
  }

  .date-wrapper :global(input) {
    padding: 0px 2px;
  }

  .date-manip {
    margin-top: 6px;
  }

  .date-manip :global(a) {
    user-select: none;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
  }
</style>
