<script lang="ts">
  import { KanjiDate, fromGengou, addYears, addMonths, addDays } from "kanjidate";
  import { AppError } from "@/lib/app-error";

  export let init: Date | null = null;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let isNullable = false;
  export let errorPrefix: string = "";

  let gengouValue: string;
  let nenValue: string = "";
  let monthValue: string = "";
  let dayValue: string = "";

  initValues(init);

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

  export function validate(): [Date | null, AppError[]] {
    if (nenValue === "" && monthValue === "" && dayValue === "") {
      if( isNullable ){
        return [null, []];
      } else {
        return [null, [mkError("入力がありません。")]];
      }
    } else {
      const errors: AppError[] = [];
      const nen = parseNenValue();
      if( nen instanceof AppError ){
        errors.push(nen);
      }
      const month = parseMonthValue();
      if( month instanceof AppError ){
        errors.push(month);
      }
      const day = parseDayValue();
      if( day instanceof AppError ){
        errors.push(day);
      }
      if( errors.length > 0 ){
        return [null, errors];
      }
      let year: number = fromGengou(gengouValue, nen as number);
      return [new Date(year, (month as number) - 1, day as number), []];
    }
  }

  function mkError(msg: string): AppError {
    return new AppError(errorPrefix + msg);
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
    const [d, _] = validate();
    if( d instanceof Date ){
      const n = event.shiftKey ? -1 : 1;
      initValues(addYears(d, n));
    }
  }

  function doMonthClick(event: MouseEvent): void {
    const [d, _] = validate();
    if( d instanceof Date ){
      const n = event.shiftKey ? -1 : 1;
      initValues(addMonths(d, n));
    }
  }

  function doDayClick(event: MouseEvent): void {
    const [d, _] = validate();
    if( d instanceof Date ){
      const n = event.shiftKey ? -1 : 1;
      initValues(addDays(d, n));
    }
  }
</script>

<div class="top date-form">
  <div class="inputs">
    <select bind:value={gengouValue} class="gengou">
      {#each gengouList as g}
        <option>{g}</option>
      {/each}
    </select>
    <input type="text" class="nen" bind:value={nenValue} />
    <span on:click={doNenClick} class="nen-span">年</span>
    <input type="text" class="month" bind:value={monthValue} />
    <span on:click={doMonthClick} class="month-span">月</span>
    <input type="text" class="day" bind:value={dayValue} />
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

  .nen-span, .month-span, .day-span {
    cursor: pointer;
  }
</style>
