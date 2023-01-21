<script lang="ts">
  import {
    KanjiDate,
    fromGengou,
    addYears,
    addMonths,
    addDays,
  } from "kanjidate";
  import { source, toInt, toPositiveInt, type VError } from "../validation";
  import { validateWareki } from "../validators/wareki-validator";

  export let date: Date | null | undefined;
  export let errors: VError[] = [];
  export let gengouList: string[] = ["昭和", "平成", "令和"];

  let gengouValue: string = gengouList[gengouList.length - 1];
  let nenValue: string = "";
  let monthValue: string = "";
  let dayValue: string = "";

  $: console.log("date change", date);
  $: initValues(date);

  export function initValues(d: Date | null | undefined): void {
    if (d != null) {
      const kdate = new KanjiDate(d);
      gengouValue = kdate.gengou;
      nenValue = kdate.nen.toString();
      monthValue = kdate.month.toString();
      dayValue = kdate.day.toString();
    }
  }

  function clearError(): void {
    errors = [];
  }

  function validate(): void {
    // clearError();
    if (nenValue === "" && monthValue === "" && dayValue === "") {
      date = null;
    } else {
      const vs = validateWareki({
        gengou: source(gengouValue),
        nen: source(nenValue).validate(toInt),
        month: source(monthValue).validate(toInt),
        day: source(dayValue).validate(toInt)
      })
      if( vs.isValid ){
        console.log("valid")
        date = vs.value;
      } else {
        console.log("invalid")
        errors = vs.errors;
      }
    }
  }

  function doNenClick(event: MouseEvent): void {
    validate();
    if (date instanceof Date) {
      const n = event.shiftKey ? -1 : 1;
      date = addYears(date, n);
    }
  }

  function doMonthClick(event: MouseEvent): void {
    validate();
    if (date instanceof Date) {
      const n = event.shiftKey ? -1 : 1;
      date = addMonths(date, n);
    }
  }

  function doDayClick(event: MouseEvent): void {
    validate();
    if (date instanceof Date) {
      const n = event.shiftKey ? -1 : 1;
      date = addDays(date, n);
    }
  }
</script>

<div class="top date-form">
  <div class="inputs">
    <select bind:value={gengouValue} class="gengou" on:change={validate}>
      {#each gengouList as g}
        <option>{g}</option>
      {/each}
    </select>
    <input type="text" class="nen" bind:value={nenValue} on:change={validate} />
    <span on:click={doNenClick} class="nen-span">年</span>
    <input
      type="text"
      class="month"
      bind:value={monthValue}
      on:change={validate}
    />
    <span on:click={doMonthClick} class="month-span">月</span>
    <input type="text" class="day" bind:value={dayValue} on:change={validate} />
    <span on:click={doDayClick} class="day-span">日</span>
  </div>
</div>

<style>
  .top {
    display: inline-block;
  }

  .inputs {
    display: flex;
    align-items: center;
  }

  .gengou {
    font-size: 1em;
    padding: 1px;
    margin-right: 2px;
  }

  .inputs span {
    margin-left: 1px;
  }

  .nen {
    margin-left: 1px;
  }

  .month,
  .day {
    margin-left: 2px;
  }

  .nen,
  .month,
  .day {
    width: 1.5em;
    font-size: 1em;
    padding: 0 1px;
  }

  .nen-span,
  .month-span,
  .day-span {
    cursor: pointer;
    user-select: none;
  }
</style>
