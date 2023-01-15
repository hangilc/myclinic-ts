<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import { Invalid } from "../validator";
  import Popup from "../Popup.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import CalendarIcon from "@/icons/CalendarIcon.svelte";

  export let date: Date | null | undefined;
  export let errors: Invalid[] = [];
  export let isNullable = false;
  export let datePickerDefault: () => Date = () => new Date();
  export let iconWidth: string = "1.3em";
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  let form: DateForm;

  $: if (date === null && !isNullable) {
    date = undefined;
    errors = [new Invalid("入力がありません。")];
  }

  export function initValues(date: Date | null): void {
    form.initValues(date);
  }

  function doDatePickerEnter(value: Date): void {
    errors = [];
    date = value;
  }
</script>

<div>
  <div class="wrapper">
    <DateForm bind:date bind:errors bind:this={form} {gengouList} />
    <slot name="spacer" />
    <slot name="icons" />
    <Popup let:destroy let:trigger>
      <CalendarIcon width={iconWidth} dy="-0.2rem" dx="0.2rem" style="cursor: pointer;"
        onClick={trigger}/>
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
  .calendar-icon {
    color: gray;
    margin-top: -0.2em;
    margin-left: 0.2em;
    cursor: pointer;
  }
</style>
