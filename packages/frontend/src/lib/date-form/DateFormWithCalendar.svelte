<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import Popup from "../Popup.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import CalendarIcon from "@/icons/CalendarIcon.svelte";
  import type { VResult } from "../validation";

  export let date: Date | null | undefined;
  export let onChange: (result: VResult<Date | null>) => void;
  export let validate: () => VResult<Date | null>;
  export let setDate: (d: Date | null) => void;
  export let datePickerDefault: () => Date = () => new Date();
  export let iconWidth: string = "1.3em";
  export let gengouList: string[] = ["昭和", "平成", "令和"];

  function doDatePickerEnter(d: Date): void {
    setDate(d);
  }

</script>

<div>
  <div class="wrapper">
    <DateForm
      bind:date
      bind:onChange
      bind:validate
      bind:setDate
      {gengouList}
    />
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
