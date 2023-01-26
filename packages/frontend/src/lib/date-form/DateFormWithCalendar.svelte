<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import Popup from "../Popup.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import CalendarIcon from "@/icons/CalendarIcon.svelte";
  import { GengouList } from "kanjidate";
  import { createEventDispatcher } from "svelte";
  import { validResult, type VResult } from "../validation";

  export let date: Date | null | undefined;
  export let datePickerDefault: () => Date = () => new Date();
  export let iconWidth: string = "1.3em";
  export let gengouList: string[] = GengouList.map(g => g.kanji);
  let dispatch = createEventDispatcher<{
    "value-change": VResult<Date | null>
  }>();

  function doDatePickerEnter(d: Date): void {
    date = d;
    dispatch("value-change", validResult(date));
  }
</script>

<div>
  <div class="wrapper">
    <DateForm bind:date on:value-change {gengouList} />
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
