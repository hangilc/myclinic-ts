<script lang="ts">
  import * as kanjidate from "kanjidate"
    import { writable, type Writable } from "svelte/store";
  import Pulldown from "../Pulldown.svelte";
    import SelectItem from "../SelectItem.svelte";

  export let date: Date | null;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  let gengouValue: string = "令和";
  let nenValue: string = "";
  let monthValue: string = "";
  if( date != null ){
    const wareki = kanjidate.toGengou(date.getFullYear(), date.getMonth() + 1, date.getDate());
    gengouValue = wareki.gengou;
    nenValue = wareki.nen.toString();
    monthValue = (date.getMonth() + 1).toString();
  }
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

  updateDays();

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
      ds.push([d.toString(), ""]);
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

</script>

<div>
  <div>
    <span on:click={doGengouClick} bind:this={gengouSpan} class="gengou-span">{gengouValue}</span>
    <span on:click={doNenClick} bind:this={nenSpan} class="nen-span">{nenValue}</span>年
    <span on:click={doMonthClick} bind:this={monthSpan} class="month-span">{monthValue}</span>月
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
      <span class={d[1]}>{d[0]}</span>
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
  .days-panel {
    display: grid;
    grid-template-columns: repeat(7, 1.5em);
  }

  .days-panel span {
    text-align: right;
  }

  .sunday {
    color: red;
  }

  .gengou-span, .nen-span, .month-span {
    cursor: pointer;
  }
</style>