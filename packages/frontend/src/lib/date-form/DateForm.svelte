<script lang="ts">
  import { addYears, addMonths, addDays } from "kanjidate";
  import { source, toInt, validResult, VResult } from "../validation";
  import { validateWareki } from "../validators/wareki-validator";
  import * as kanjidate from "kanjidate";
  import { createEventDispatcher, onMount } from "svelte";

  export let init: Date | null;
  export let gengouList: string[] = kanjidate.GengouList.map((g) => g.kanji);
  export function setValue(value: Date | null): void {
    updateValues(value);
  }
  let dispatch = createEventDispatcher<{ "value-change": void }>();
  let gengou: string = gengouList.length > 0 ? gengouList[0] : "";;
  let nen: string;
  let month: string;
  let day: string;

  updateValues(init);

  function updateValues(date: Date | null): void {
    if (date === null) {
      nen = "";
      month = "";
      day = "";
    } else {
      const k = new kanjidate.KanjiDate(date);
      gengou = k.gengou;
      nen = k.nen.toString();
      month = (date.getMonth() + 1).toString();
      day = date.getDate().toString();
    }
  }

  export function validate(): VResult<Date | null> {
    if (nen === "" && month === "" && day === "") {
      return validResult(null);
    } else {
      return validateWareki({
        gengou: source(gengou),
        nen: source(nen).validate(toInt),
        month: source(month).validate(toInt),
        day: source(day).validate(toInt),
      });
    }
  }

  function modifyDateFromIntern(f: (d: Date) => Date): void {
    const vs = validate();
    if (vs.isValid) {
      if (vs.value !== null) {
        const value = f(vs.value);
        updateValues(value);
        dispatch("value-change");
      }
    }
  }

  function handleUserInput(): void {
    const vs = validate();
    if (vs.isValid) {
      updateValues(vs.value);
    }
    dispatch("value-change");
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
    <select bind:value={gengou} class="gengou" on:change={doInputChange} data-cy="gengou-select">
      {#each gengouList as g}
        <option data-cy="gengou-option">{g}</option>
      {/each}
    </select>
    <input
      type="text"
      class="nen"
      bind:value={nen}
      on:change={doInputChange}
      data-cy="nen-input"
    />
    <span on:click={doNenClick} class="nen-span">年</span>
    <input
      type="text"
      class="month"
      bind:value={month}
      on:change={doInputChange}
      data-cy="month-input"
    />
    <span on:click={doMonthClick} class="month-span" >月</span>
    <input
      type="text"
      class="day"
      bind:value={day}
      on:change={doInputChange}
      data-cy="day-input"
    />
    <span on:click={doDayClick} class="day-span" >日</span>
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
