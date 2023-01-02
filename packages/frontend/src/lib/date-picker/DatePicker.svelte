<script lang="ts">
  import * as kanjidate from "kanjidate";
  import GengouPart from "./GengouPart.svelte";
  import NenPart from "./NenPart.svelte";
  import DayPart from "./DayPart.svelte";
  import MonthPart from "./MonthPart.svelte";
  import DaysPanel from "./DaysPanel.svelte";
  import { listDateItems, type DateItem } from "./date-item";
  import { composeDate } from "./date-picker-misc";

  export let date: Date;
  export let destroy: () => void;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let onEnter: (date: Date) => void;
  let gengou: string;
  let nen: number;
  let month: number;
  let day: number;
  let items: DateItem[];
  update_with(date);

  function update_with(d: Date): void {
    const wareki = kanjidate.toGengou(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    );
    gengou = wareki.gengou;
    nen = wareki.nen;
    month = d.getMonth() + 1;
    day = d.getDate();
    items = listDateItems(d);
    date = d;
  }

  function onGengouChange(g: string): void {
    update_with(composeDate(g, nen, month, day));
  }

  function onNenChange(n: number): void {
    update_with(composeDate(gengou, n, month, day));
  }

  function onMonthChange(m: number): void {
    update_with(composeDate(gengou, nen, m, day));
  }

  function onDayChange(d: number): void {
    update_with(composeDate(gengou, nen, month, d));
  }

  function onDaysPanelChange(d: Date): void {
    update_with(d);
  }

  function doEnter(): void {
    onEnter(date);
    destroy();
  }

  function doCancel(): void {
    destroy();
  }
</script>

<div>
  <div class="top-row">
    <GengouPart {gengou} {gengouList} onChange={onGengouChange} />
    <NenPart {nen} {gengou} onChange={onNenChange} />
    <MonthPart {month} onChange={onMonthChange} />
    <DayPart {day} {gengou} {nen} {month} onChange={onDayChange}/>
    <span class="spacer" />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      on:click={doEnter}
      class="enter-check"
      width="1.2em"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      on:click={doCancel}
      class="cancel-mark"
      width="1.2em"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </div>
  <DaysPanel {items} onChange={onDaysPanelChange}/>
</div>

<style>
  .top-row {
    display: flex;
    align-items: center;
  }

  .spacer {
    flex-grow: 1;
  }

  .enter-check {
    color: green;
    margin-left: 4px;
    cursor: pointer;
  }

  .cancel-mark {
    color: red;
    margin-left: 2px;
    cursor: pointer;
  }
</style>
