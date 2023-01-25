<script lang="ts">
  import { addYears, addMonths, addDays } from "kanjidate";
  import { source, toInt, validResult, VResult } from "../validation";
  import { validateWareki } from "../validators/wareki-validator";
  import { DateFormValues } from "./date-form-values";
  import * as kanjidate from "kanjidate";
  import { createEventDispatcher, onMount } from "svelte";

  export let date: Date | null;
  export let gengouList: string[] = kanjidate.GengouList.map((g) => g.kanji);
  export function validate(): VResult<Date | null> {
    return validateValues(values);
  }
  let dispatch =
    createEventDispatcher<{
      "date-form-value": VResult<Date | null>;
    }>();
  
  $: values = formValues(date);
  $: dispatchValues(values);

  onMount(() => dispatchValues(values));

  function dispatchValues(values: DateFormValues): void {
    dispatch("date-form-value", validateValues(values));
  }

  function modifyDateFromIntern(f: (d: Date) => Date): void {
    if (date !== undefined && date !== null) {
      date = (f(date));
    }
  }

  function handleUserInput(): void {
    const vs = validate();
    if (vs.isValid) {
      date = vs.value;
    } else {
      dispatch("date-form-value", vs);
    }
  }

  function formValues(date: Date | null): DateFormValues {
    return new DateFormValues(date, gengouList[0]);
  }

  function validateValues(values: DateFormValues): VResult<Date | null> {
    if (values.nen === "" && values.month === "" && values.day === "") {
      return validResult(null);
    } else {
      return validateWareki({
        gengou: source(values.gengou),
        nen: source(values.nen).validate(toInt),
        month: source(values.month).validate(toInt),
        day: source(values.day).validate(toInt),
      });
    }
  }

  function doInputChange(): void {
    handleUserInput();
  }

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
      value={values.day}
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
