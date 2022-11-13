<script lang="ts">
  import * as kanjidate from "kanjidate";
  import DateFormPulldown from "../date-form/DateFormPulldown.svelte";
  import DatePickerPulldown from "../date-picker/DatePickerPulldown.svelte";

  export let date: Date | null;
  export let errors: string[];
  export let isNullable = false;
  export let format: (date: Date | null) => string = (date: Date | null) => {
    if (date == null) {
      return "（未設定）";
    } else {
      return kanjidate.format(kanjidate.f2, date);
    }
  };
  export let datePickerDefault: () => Date = () => new Date();
  let repr: string;
  let form: DateFormPulldown;
  let datePicker: DatePickerPulldown;
  $: repr = format(date);

  function doClick(): void {
    form.open(date);
  }

  function doCalClick(): void {
    datePicker.open(date || datePickerDefault());
  }
</script>

<div class="disp">
  <span class="repr" on:click={doClick}>{repr}</span>
  <slot name="icons" />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1.1em"
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
<DateFormPulldown
  bind:errors={errors}
  {isNullable}
  onEnter={(d) => (date = d)}
  bind:this={form}
/>
<DatePickerPulldown bind:this={datePicker} onEnter={d => date = d}/>

<style>
  .disp {
    display: inline-flex;
    justify-items: center;
  }

  .disp .repr {
    cursor: pointer;
    margin-right: 6px;
  }

  .calendar-icon {
    color: #666;
    display: inline-block;
    margin-top: -3px;
    margin-left: 4px;
    cursor: pointer;
  }
</style>
