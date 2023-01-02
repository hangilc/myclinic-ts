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
      <CalendarIcon width={iconWidth} dy="-0.2rem" dx="0.2rem" style="cursor: pointer;"/>
      <!-- <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconWidth}
        class="calendar-icon"
        on:click={trigger}
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg> -->
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
