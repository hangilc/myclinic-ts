<script lang="ts">
  import * as kanjidate from "kanjidate";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import CalendarIcon from "../../icons/CalendarIcon.svelte";
  import { dateFormPulldown } from "../date-form/date-form-pulldown";
  import { datePickerPopup } from "../date-picker/date-picker-popup";

  export let date: Date | null;
  export let format: (date: Date | null) => string = (date: Date | null) => {
    if (date == null) {
      return "（未設定）";
    } else {
      return kanjidate.format(kanjidate.f2, date);
    }
  };
  export let datePickerDefault: () => Date = () => new Date();
  export let onChange: () => void = () => {};

  function doChange(d: Date | null): void {
    date = d;
    onChange();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore missing-declaration -->
<div class="disp">
    <span class="repr" on:click={dateFormPulldown(() => date, doChange)}>{format(date)}</span>
    <!-- <DateFormPulldown slot="menu" {destroy} init={date} onEnter={doChange} /> -->
  <slot name="icons" />
    <CalendarIcon
      dy="0px"
      dx="4px"
      onClick={datePickerPopup(() => date || datePickerDefault(), doChange)}
      style="cursor: pointer;"
    />
    <!-- <DatePicker
      slot="menu"
      date={date || datePickerDefault()}
      {destroy}
      onEnter={doChange}
    /> -->
</div>

<style>
  .disp {
    display: inline-flex;
    justify-items: center;
  }

  .disp .repr {
    cursor: pointer;
  }
</style>
