<script lang="ts">
  import * as kanjidate from "kanjidate";
  import DateFormPulldown from "../date-form/DateFormPulldown.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import Popup from "../Popup.svelte";
  import CalendarIcon from "../../icons/CalendarIcon.svelte";

  export let date: Date | null;
  export let format: (date: Date | null) => string = (date: Date | null) => {
    if (date == null) {
      return "（未設定）";
    } else {
      return kanjidate.format(kanjidate.f2, date);
    }
  };
  export let datePickerDefault: () => Date = () => new Date();

  function doChange(d: Date | null): void {
    date = d;
  }
</script>

<div class="disp">
  <Popup let:destroy let:trigger>
    <span class="repr" on:click={trigger}>{format(date)}</span>
    <DateFormPulldown slot="menu" {destroy} init={date} onEnter={doChange} />
  </Popup>
  <slot name="icons" />
  <Popup let:destroy let:triggerClick>
    <CalendarIcon
      dy="0px"
      dx="4px"
      onClick={triggerClick}
      style="cursor: pointer;"
    />
    <DatePicker
      slot="menu"
      date={date || datePickerDefault()}
      {destroy}
      onEnter={doChange}
    />
  </Popup>
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
