<script lang="ts">
  import {
    KanjiDate,
    fromGengou,
    addYears,
    addMonths,
    addDays,
  } from "kanjidate";
  import { string, notEmpty, toNumber, integer } from "@/lib/validator";

  export let date: Date | null | undefined;
  export let errors: string[];
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let isNullable = false;
  export let errorPrefix: string = "";

  let gengouValue: string;
  let nenValue: string = "";
  let monthValue: string = "";
  let dayValue: string = "";

  $: {
    if (date !== undefined) {
      initValues(date);
      validate();
    }
  }

  export function initValues(d: Date | null): void {
    if (d == null) {
      nenValue = "";
      monthValue = "";
      dayValue = "";
    } else {
      let kdate: KanjiDate | null;
      kdate = new KanjiDate(d);
      gengouValue = kdate.gengou;
      nenValue = kdate.nen.toString();
      monthValue = kdate.month.toString();
      dayValue = kdate.day.toString();
    }
  }

  function clearError(): void {
    errors = [];
  }

  const intValidator = string.bind(notEmpty).bind(toNumber).bind(integer);

  const nenSchema = intValidator;
  const monthSchema = intValidator;
  const daySchema = intValidator;

  function validate(): void {
    clearError();
    if (nenValue === "" && monthValue === "" && dayValue === "") {
      if (isNullable) {
        date = null;
      } else {
        date = undefined;
        errors.push(errorPrefix + "入力がありません。");
      }
    } else {
      const validated = {
        nen: nenSchema
          .validate(nenValue)
          .unwrap(errors, () => errorPrefix + "年："),
        month: monthSchema
          .validate(monthValue)
          .unwrap(errors, () => errorPrefix + "月："),
        day: daySchema
          .validate(dayValue)
          .unwrap(errors, () => errorPrefix + "日："),
      };
      if (errors.length === 0) {
        let year: number = fromGengou(gengouValue, validated.nen);
        date = new Date(year, validated.month - 1, validated.day);
      } else {
        date = undefined;
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
