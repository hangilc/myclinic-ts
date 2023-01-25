<script lang="ts">
  import { DateFormValues } from "@/lib/date-form/date-form-values";
  import { validResult, VResult } from "@/lib/validation";
  import { addYears, addMonths, addDays } from "kanjidate";

  export let date: Date | null | undefined;
  export const setDate: (d: Date | null) => void = setDateFromExtern;
  export let onChange: (result: VResult<Date | null>) => void;

  const gengouList = ["令和", "平成", "昭和"];

  let values: DateFormValues = formValues(date ?? null);

  function setDateFromExtern(d: Date | null): void {
    date = d;
    values = formValues(d);
    onChange(validResult(d));
  }

  function modifyDateFromIntern(f: (d: Date) => Date): void {
    if( date !== undefined && date !== null ){
      setDateFromExtern(f(date));
    }
  }

  function formValues(date: Date | null): DateFormValues {
    return new DateFormValues(date, gengouList[0]);
  }

  function doInputChange(): void {}

  function doModify(f: (d: Date) => Date): void {
    modifyDateFromIntern(f);
  }

  function doNenClick(event: MouseEvent): void {
    doModify((d) => addYears(d, event.shiftKey ? -1 : 1));
  }

  function doMonthClick(event: MouseEvent): void {
    doModify((d) => addMonths(d, event.shiftKey ? -1 : 1));
  }

  function doDayClick(event: MouseEvent): void {
    doModify((d) => addDays(d, event.shiftKey ? -1 : 1));
  }
</script>

<div class="top date-form">
  <div class="inputs">
    <select bind:value={values.gengou} class="gengou" on:change={doInputChange}>
      {#each gengouList as g}
        <option>{g}</option>
      {/each}
    </select>
    <input
      type="text"
      class="nen"
      bind:value={values.nen}
      on:change={doInputChange}
    />
    <span on:click={doNenClick} class="nen-span">年</span>
    <input
      type="text"
      class="month"
      bind:value={values.month}
      on:change={doInputChange}
    />
    <span on:click={doMonthClick} class="month-span">月</span>
    <input
      type="text"
      class="day"
      bind:value={values.day}
      on:change={doInputChange}
    />
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
