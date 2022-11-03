<script lang="ts">
  import { KanjiDate, fromGengou } from "kanjidate";
  import { AppError } from "@/lib/app-error";

  export let date: Date | null;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let isNullable = false;

  let gengouValue: string;
  let nenValue: string = "";
  let monthValue: string = "";
  let dayValue: string = "";

  $: updateValues(date);

  function updateValues(d: Date | null): void {
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

  function parseNenValue(): number | AppError {
    const y = parseInt(nenValue);
    if (isNaN(y)) {
      return new AppError("年の入力が数字でありません。");
    }
    return y;
  }

  function parseMonthValue(): number | AppError {
    const m = parseInt(monthValue);
    if (isNaN(m)) {
      return new AppError("月の入力が数字でありません。");
    }
    return m;
  }

  function parseDayValue(): number | AppError {
    const d = parseInt(dayValue);
    if (isNaN(d)) {
      return new AppError("日の入力が数字でありません。");
    }
    return d;
  }

  export function getValue(): Date | null | AppError {
    if (nenValue === "" && monthValue === "" && dayValue === "") {
      if( isNullable ){
        return null;
      } else {
        return new AppError("入力がありません。")
      }
    } else {
      const nen = parseNenValue();
      if( nen instanceof AppError ){
        return nen;
      }
      const month = parseMonthValue();
      if( month instanceof AppError ){
        return month;
      }
      const day = parseDayValue();
      if( day instanceof AppError ){
        return day;
      }
      let year: number = fromGengou(gengouValue, nen);
      return new Date(year, month - 1, day);
    }
  }

  export function setValue(d: Date): void {
    date = d;
  }

  export function clearValue(): void {
    date = null;
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
    <span>年</span>
    <input type="text" class="month" bind:value={monthValue} />
    <span>月</span>
    <input type="text" class="day" bind:value={dayValue} />
    <span>日</span>
  </div>
</div>

<style>
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
  }
</style>
