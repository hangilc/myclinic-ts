<script lang="ts">
  import GengouPart from "./GengouPart.svelte";
  import NenPart from "./NenPart.svelte";
  import DayPart from "./DayPart.svelte";
  import MonthPart from "./MonthPart.svelte";
  import DaysPanel from "./DaysPanel.svelte";
  import { listDateItems, type DateItem } from "./date-item";
  import { composeDate } from "./date-picker-misc";
  import { warekiOf } from "myclinic-util";

  export let date: Date;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let onEnter: (date: Date) => void;
  export let onCancel: () => void;
  export let commands: ("today")[] = ["today"];

  let gengou: string;
  let nen: number;
  let month: number;
  let day: number;
  let items: DateItem[];
  updateWith(date);

  function updateWith(d: Date): void {
    const wareki = warekiOf(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    );
    gengou = wareki.gengou.name;
    nen = wareki.nen;
    month = d.getMonth() + 1;
    day = d.getDate();
    items = listDateItems(d);
    date = d;
  }

  function onGengouChange(g: string): void {
    updateWith(composeDate(g, nen, month, day));
  }

  function onNenChange(n: number): void {
    updateWith(composeDate(gengou, n, month, day));
  }

  function onMonthChange(m: number): void {
    updateWith(composeDate(gengou, nen, m, day));
  }

  function onDayChange(d: number): void {
    updateWith(composeDate(gengou, nen, month, d));
  }

  function onDaysPanelChange(d: Date): void {
    updateWith(d);
  }

  function doEnter(): void {
    onEnter(date);
  }

  function doCancel(): void {
    onCancel();
  }

  function doToday() {
    updateWith(new Date());
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
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
  <div class="commands">
    {#each commands as command}
      {#if command === "today"}
        <button on:click={doToday}>今日</button>
      {/if}
    {/each}
  </div>
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

  .commands button {
    font-size: 10px;
  }
</style>
