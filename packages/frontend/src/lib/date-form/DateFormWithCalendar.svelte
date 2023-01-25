<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import Popup from "../Popup.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import CalendarIcon from "@/icons/CalendarIcon.svelte";
  import { GengouList } from "kanjidate";

  export let date: Date | null | undefined;
  export let datePickerDefault: () => Date = () => new Date();
  export function setDate(d: Date | null): void { setFormDate(d) }; 
  export let iconWidth: string = "1.3em";
  export let gengouList: string[] = GengouList.map(g => g.kanji);

  let setFormDate: (d: Date | null) => void;

  function doDatePickerEnter(d: Date): void {
    setDate(d);
  }
</script>

<div>
  <div class="wrapper">
    <DateForm bind:date on:value-changed bind:setDate={setFormDate} {gengouList} />
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
