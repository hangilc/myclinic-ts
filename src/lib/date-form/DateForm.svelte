<script lang="ts">
  import { KanjiDate, fromGengou } from "kanjidate";

  export let date: Date | null;
  export let onEnter: (value: Date | null) => void = _ => {};
  export let onCancel: () => void = () => {};
  let gengouValue: string;
  let nenValue: string = "";
  let monthValue: string = "";
  let dayValue: string = "";
  let error: string = "";
  updateValues(date);

  function updateValues(d: Date | null): void {
    if (d == null) {
    } else {
      let kdate: KanjiDate | null;
      if (d == null) {
        nenValue = "";
        monthValue = "";
        dayValue = "";
      } else {
        kdate = new KanjiDate(d);
        gengouValue = kdate.gengou;
        nenValue = kdate.nen.toString();
        monthValue = kdate.month.toString();
        dayValue = kdate.day.toString();
      }
    }
  }

  function parseNenValue(): number {
    const y = parseInt(monthValue);
    if( isNaN(y) ){
      throw new Error("年の入力が数字でありません。");
    }
    return y;
  }

  function parseMonthValue(): number {
    const m = parseInt(monthValue);
    if( isNaN(m) ){
      throw new Error("月の入力が数字でありません。");
    }
    return m;
  }

  function parseDayValue(): number {
    const d = parseInt(dayValue);
    if( isNaN(d) ){
      throw new Error("日の入力が数字でありません。");
    }
    return d;
  }

  export function getValue(): Date {
    let year: number = fromGengou(gengouValue, parseNenValue());
    return new Date(year, parseMonthValue(), parseDayValue());
  }

  export function setValue(d: Date): void {
    updateValues(d);
  }

  export function clearValue(): void {
    updateValues(null);
  }

  function doEnter(): void {
    try {
      const d = getValue();
      onEnter(d);
    } catch(ex) {
      error = ex.toString();
      console.log(error);
    }
  }

  function doCancel(): void {
    onCancel();
  }
</script>

<div class="top date-form">
  {#if error !== ""}
  <div class="error">{error}</div>
  {/if}
  <div class="inputs">
    <select bind:value={gengouValue}>
      <option>昭和</option>
      <option>平成</option>
      <option>令和</option>
    </select>
    <input type="text" class="nen" bind:value={nenValue} />
    <span>年</span>
    <input type="text" class="month" bind:value={monthValue} />
    <span>月</span>
    <input type="text" class="day" bind:value={dayValue} />
    <span>日</span>
  </div>
  <div class="commands">
    <slot name="aux-commands" />
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
</div>

<style>
  .inputs {
    display: flex;
    align-items: center;
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
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
  }

  .commands button {
    margin-left: 4px;
  }

  .error {
    margin: 6px 0;
    color: red;
  }
</style>
