<script lang="ts">
  import { FormatDate } from "myclinic-util";
  import CalendarIcon from "../../icons/CalendarIcon.svelte";
  import { dateFormPulldown } from "../date-form/date-form-pulldown";
  import { datePickerPopup } from "../date-picker/date-picker-popup";

  export let date: Date | null;
  export let format: (date: Date | null) => string = (date: Date | null) => {
    if (date == null) {
      return "（未設定）";
    } else {
      return FormatDate.f2(date);
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
  <span class="repr" on:click={dateFormPulldown(() => date, doChange)}
    >{format(date)}</span
  >
  <slot name="icons" />
  <CalendarIcon
    dy="-3.5px"
    dx="4px"
    onClick={datePickerPopup(() => date || datePickerDefault(), doChange)}
    style="cursor: pointer;"
  />
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
