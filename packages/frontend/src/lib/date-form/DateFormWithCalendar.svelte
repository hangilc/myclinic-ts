<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import {
    VResult,
    errorMessagesOf,
    validResult,
    invalid,
  } from "../validation";
  import Popup from "../Popup.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import CalendarIcon from "@/icons/CalendarIcon.svelte";

  export let date: Date | null;
  export let onChange: (result: VResult<Date | null>) => void;
  export let validate: () => VResult<Date | null>;
  export let datePickerDefault: () => Date = () => new Date();
  export let iconWidth: string = "1.3em";
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  let errors: string[] = [];

  onChange(validResult(date));

  function doDatePickerEnter(d: Date): void {
    errors = [];
    date = d;
    onChange(validResult(d));
  }

  function doFormChange(result: VResult<Date | null>): void {
    if (result.isValid) {
      if (result.value === null && !isNullable) {
        errors = ["入力がありません"];
        onChange(invalid<Date | null>("入力がありません", []));
      } else {
        date = result.value;
        onChange(result);
      }
    } else {
      errors = errorMessagesOf(result.errors);
      onChange(result);
    }
  }
</script>

<div>
  <div class="wrapper">
    <DateForm {date} onChange={doFormChange} {gengouList} bind:validate/>
    <slot name="spacer" />
    <slot name="icons" />
    <Popup let:destroy let:trigger>
      <CalendarIcon
        width={iconWidth}
        dy="-0.2rem"
        dx="0.2rem"
        style="cursor: pointer;"
        onClick={trigger}
      />
      <DatePicker
        slot="menu"
        {destroy}
        date={date ?? datePickerDefault()}
        onEnter={doDatePickerEnter}
      />
    </Popup>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    justify-items: baseline;
  }
</style>
