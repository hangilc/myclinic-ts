<script lang="ts">
  import * as kanjidate from "kanjidate"
    import { dataset_dev } from "svelte/internal";
    import { writable, type Writable } from "svelte/store";
  import Pulldown from "../Pulldown.svelte";
    import SelectItem from "../SelectItem.svelte";

  export let date: Date;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let onEnter: (date: Date) => void = _ => {};
  export let onCancel: () => void = () => {};
  let gengouValue: string = "令和";
  let nenValue: string = "";
  let monthValue: string = "";
  let selectedDay: number;
  initValues(date);
  let gengouSpan: HTMLElement;
  let gengouPulldown: Pulldown;
  let gengouSelect: Writable<string | null> = writable(null);
  let nenLast: number = 1;
  let nenSpan: HTMLElement;
  let nenPulldown: Pulldown;
  let nenSelect: Writable<number | null> = writable(null);
  let monthSpan: HTMLElement;
  let monthSelect: Writable<number | null> = writable(null);
  let monthPulldown: Pulldown;

  let days: [string, string][] = [
    ["1", ""], ["2", ""]
  ]

  updateDays();

  gengouSelect.subscribe(g => {
    if( g != null ){
      gengouValue = g;
      updateDays();
    }
  })

  nenSelect.subscribe(n => {
    if( n != null ){
      nenValue = n.toString();
      updateDays();
    }
  })

  monthSelect.subscribe(m => {
    if( m != null ){
      monthValue = m.toString();
      updateDays();
    }
  })

  function initValues(date: Date): void {
    const wareki = kanjidate.toGengou(date.getFullYear(), date.getMonth() + 1, date.getDate());
    gengouValue = wareki.gengou;
    nenValue = wareki.nen.toString();
    monthValue = (date.getMonth() + 1).toString();
    selectedDay = date.getDate();
  }

  function updateDays(): void {
    const year = kanjidate.fromGengou(gengouValue, parseInt(nenValue));
    const month = parseInt(monthValue);
    const firstDay = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDay.getDay();  // Sunday: 0
    let ds: [string, string][] = [];
    let i: number;
    for(i=firstDayOfWeek;i>0;i--){
      ds.push(["", "pre"]);
    }
    let lastDay = kanjidate.lastDayOfMonth(year, month);
    for(let d=1;d<=lastDay;d++){
      let cls: string;
      if( d == selectedDay ){
        cls = "selected"
      } else {
        cls = "";
      }
      ds.push([d.toString(), cls]);
    }
    days = ds;
  }

  function doGengouClick(): void {
    gengouPulldown.open();
  }

  function doNenClick(): void {
    const g = kanjidate.Gengou.fromString(gengouValue);
    nenLast = kanjidate.nenRangeOf(g)[1];
    nenPulldown.open();
  }

  function doMonthClick(): void {
    monthPulldown.open();
  }

  function doNenLabelClick(event: MouseEvent): void {
    const n = event.shiftKey ? -1 : 1;
    const d = kanjidate.addYears(getCurrentDate(), n);
    initValues(d);
    updateDays();
  }

  function doMonthLabelClick(event: MouseEvent): void {
    const n = event.shiftKey ? -1 : 1;
    const d = kanjidate.addMonths(getCurrentDate(), n);
    initValues(d);
    updateDays();
  }

  function getCurrentDate(): Date {
    const year = kanjidate.fromGengou(gengouValue, parseInt(nenValue));
    const month = parseInt(monthValue);
    const day = selectedDay;
    return new Date(year, month - 1, day);
  }

  function doEnter(): void {
    onEnter(getCurrentDate());
  }

  function doCancel(): void {
    onCancel();
  }

</script>

<div>
  <div class="top-row">
    <span on:click={doGengouClick} bind:this={gengouSpan} class="gengou-span">{gengouValue}</span>
    <span on:click={doNenClick} bind:this={nenSpan} class="nen-span">{nenValue}</span>
    <span on:click={doNenLabelClick} class="nen-label">年</span>
    <span on:click={doMonthClick} bind:this={monthSpan} class="month-span">{monthValue}</span>
    <span on:click={doMonthLabelClick} class="month-label">月</span>
    <svg xmlns="http://www.w3.org/2000/svg" on:click={doEnter} class="enter-check" width="1.2em" 
      fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" on:click={doCancel} class="cancel-mark" width="1.2em"
      fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
      </div>
  <div class="days-panel">
    <span class="sunday">日</span>
    <span>月</span>
    <span>火</span>
    <span>水</span>
    <span>木</span>
    <span>金</span>
    <span>土</span>
    {#each days as d}
      <span class={d[1]} class:selected={parseInt(d[0]) === selectedDay}
        on:click={() => selectedDay = parseInt(d[0])}>
        {d[0]}
      </span>
    {/each}
  </div>
</div>
<Pulldown anchor={gengouSpan} bind:this={gengouPulldown}>
  <svelte:fragment>
    {#each gengouList as gengou}
    <SelectItem data={gengou}  selected={gengouSelect}>{gengou}</SelectItem>
    {/each}
  </svelte:fragment>
</Pulldown>
<Pulldown anchor={nenSpan} bind:this={nenPulldown}>
  <svelte:fragment>
    {#each Array.from(new Array(nenLast), (_, i) => i + 1) as n}
    <SelectItem data={n} selected={nenSelect}>{n}</SelectItem>
    {/each}
  </svelte:fragment>
</Pulldown>
<Pulldown anchor={monthSpan} bind:this={monthPulldown}>
  <svelte:fragment>
    {#each Array.from(new Array(12), (_, i) => i + 1) as m}
    <SelectItem data={m} selected={monthSelect}>{m}</SelectItem>
    {/each}
  </svelte:fragment>
</Pulldown>


<style>
  .top-row {
    display: flex;
    align-items: center;
  }

  .nen-label, .month-label {
    cursor: pointer;
  }

  .enter-check {
    color: green;
    margin-left: 2.2em;
    cursor: pointer;
  }

  .cancel-mark {
    color: red;
    margin-left: 4px;
    cursor: pointer;
  }

  .days-panel {
    display: grid;
    grid-template-columns: repeat(7, 1.5em);
  }

  .days-panel span {
    text-align: right;
    cursor: default;
  }

  .days-panel span.selected {
    background-color: #ccc;
  }

  .sunday {
    color: red;
  }

  .gengou-span, .nen-span, .month-span {
    cursor: pointer;
  }
</style>