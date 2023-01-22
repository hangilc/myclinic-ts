<script lang="ts">
  import {
    KanjiDate,
    addYears,
    addMonths,
    addDays,
  } from "kanjidate";
  import {
    isNotNull,
    source,
    toInt,
    valid,
    VResult,
  } from "../validation";
  import { validateWareki } from "../validators/wareki-validator";

  export let date: Date | null;
  export let onChange: (result: VResult<Date | null>) => void;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  let errors: string[] = [];

  let gengouValue: string = gengouList[gengouList.length - 1];
  let nenValue: string = "";
  let monthValue: string = "";
  let dayValue: string = "";

  $: initValues(date);

  export function initValues(d: Date | null): void {
    if (d != null) {
      const kdate = new KanjiDate(d);
      gengouValue = kdate.gengou;
      nenValue = kdate.nen.toString();
      monthValue = kdate.month.toString();
      dayValue = kdate.day.toString();
    } else {
      nenValue = "";
      monthValue = "";
      dayValue = "";
    }
  }

  function validate(): VResult<Date | null> {
    if (nenValue === "" && monthValue === "" && dayValue === "") {
      return valid<Date | null>(null, []);
    } else {
      return validateWareki({
        gengou: source(gengouValue),
        nen: source(nenValue).validate(toInt),
        month: source(monthValue).validate(toInt),
        day: source(dayValue).validate(toInt),
      });
    }
  }

  function doInputChange(): void {
    onChange(validate());
  }

  function handleChangeRequest(f: (d: Date) => Date): void {
    const vs = validate();
    if (vs.isValid && vs.value !== null) {
      onChange(vs.validate(isNotNull).map(f));
    }
  }

  function doNenClick(event: MouseEvent): void {
    handleChangeRequest((d) => addYears(d, event.shiftKey ? -1 : 1));
  }

  function doMonthClick(event: MouseEvent): void {
    handleChangeRequest((d) => addMonths(d, event.shiftKey ? -1 : 1));
  }

  function doDayClick(event: MouseEvent): void {
    handleChangeRequest((d) => addDays(d, event.shiftKey ? -1 : 1));
  }
</script>

<div class="top date-form">
  <div class="inputs">
    <select bind:value={gengouValue} class="gengou" on:change={doInputChange}>
      {#each gengouList as g}
        <option>{g}</option>
      {/each}
    </select>
    <input type="text" class="nen" bind:value={nenValue} on:change={doInputChange} />
    <span on:click={doNenClick} class="nen-span">年</span>
    <input
      type="text"
      class="month"
      bind:value={monthValue}
      on:change={doInputChange}
    />
    <span on:click={doMonthClick} class="month-span">月</span>
    <input type="text" class="day" bind:value={dayValue} on:change={doInputChange} />
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
