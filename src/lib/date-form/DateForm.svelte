<script lang="ts">
  import {
    KanjiDate,
    fromGengou,
    addYears,
    addMonths,
    addDays,
  } from "kanjidate";
  import { AppError } from "@/lib/app-error";

  export let date: Date | null | undefined;
  export const errors: AppError[] = [];
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
    }
  }

  export function initValues(d: Date | null ): void {
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

  function hasError(): boolean {
    return errors.length > 0;
  }

  function clearError(): void {
    errors.splice(0, errors.length);
  }

  function validate(): void {
    clearError();
    if (nenValue === "" && monthValue === "" && dayValue === "") {
      if (isNullable) {
        date = null;
      } else {
        date = undefined;
        errors.push(mkError("入力がありません。"));
      }
    } else {
      const nen = parseNenValue();
      if (nen instanceof AppError) {
        errors.push(nen);
      }
      const month = parseMonthValue();
      if (month instanceof AppError) {
        errors.push(month);
      }
      const day = parseDayValue();
      if (day instanceof AppError) {
        errors.push(day);
      }
      if (errors.length === 0) {
        let year: number = fromGengou(gengouValue, nen as number);
        date = new Date(year, (month as number) - 1, day as number);
      } else {
        date = undefined;
      }
    }
  }

  function mkError(msg: string): AppError {
    return new AppError(errorPrefix + msg);
  }

  const patDigits = /^\d+$/;

  function isAllDigits(s: string): boolean {
    return patDigits.test(s);
  }

  function parseNenValue(): number | AppError {
    const y = parseInt(nenValue);
    if (isNaN(y)) {
      return mkError("年の入力が数字でありません。");
    }
    return y;
  }

  function parseMonthValue(): number | AppError {
    const m = parseInt(monthValue);
    if (isNaN(m)) {
      return mkError("月の入力が数字でありません。");
    }
    return m;
  }

  function parseDayValue(): number | AppError {
    const d = parseInt(dayValue);
    if (isNaN(d)) {
      return mkError("日の入力が数字でありません。");
    }
    return d;
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
