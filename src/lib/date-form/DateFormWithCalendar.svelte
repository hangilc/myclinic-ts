<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import type { AppError } from "../app-error";
  import DatePickerPulldown from "../date-picker/DatePickerPulldown.svelte";

  export let init: Date | null = null;
  export let isNullable = false;
  export let datePickerDefault: () => Date = () => new Date();
  export let errorPrefix: string = "";
  export let iconWidth: string = "1.1em";
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  let form: DateForm;
  let datePicker: DatePickerPulldown;

  export function initValues(date: Date | null): void {
    form.initValues(date);
  }

  export function validate(): [Date | null, AppError[]] {
    return form.validate();
  }

  function doCalClick(): void {
    let [d, errs] = form.validate();
    if( d == null || errs.length > 0 ){
      d = datePickerDefault();
    }
    datePicker.open(d);
  }

  function doDatePickerEnter(value: Date): void {
    form.initValues(value);
  }
</script>

<div>
  <div class="wrapper">
    <DateForm {init} {isNullable} bind:this={form} {errorPrefix} 
      {gengouList} />
    <slot name="spacer" />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconWidth}
      class="calendar-icon"
      on:click={doCalClick}
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
    </svg>
  </div>
</div>
<DatePickerPulldown bind:this={datePicker} onEnter={(d) => doDatePickerEnter(d)}/>

<style>
  .wrapper {
    display: flex;
    justify-items: baseline;
  }
  .calendar-icon {
    color: gray;
    margin-top: -0.3em;
    cursor: pointer;
  }
</style>
