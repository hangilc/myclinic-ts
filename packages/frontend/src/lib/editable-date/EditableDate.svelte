<script lang="ts">
  import * as kanjidate from "kanjidate";
  import { openDateFormPulldown } from "../date-form/date-form-pulldown-op";
  import DateFormPulldown from "../date-form/DateFormPulldown.svelte";
  import { openDatePickerPulldown } from "../date-picker/date-picker-op";
  import PulldownMenu from "../PulldownMenu.svelte";

  export let date: Date | null;
  export let isNullable = false;
  export let format: (date: Date | null) => string = (date: Date | null) => {
    if (date == null) {
      return "（未設定）";
    } else {
      return kanjidate.format(kanjidate.f2, date);
    }
  };
  export let datePickerDefault: () => Date = () => new Date();
  export let onChange: (date: Date | null) => void = _ => {};

  function doClick(ev: Event): void {
    openDateFormPulldown(
      date,
      ev.target as HTMLElement,
      (d: Date | null) => {
        date = d;
        onChange(d);
      },
      isNullable
    );
  }

  function doCalClick(ev: Event): void {
    openDatePickerPulldown(
      date ?? datePickerDefault(),
      ev.target as any,
      (d: Date) => {
        date = d;
        onChange(d);
      }
    );
  }
</script>

<div class="disp">
  <PulldownMenu let:destroy let:trigger>
    <span class="repr" on:click={trigger}>{format(date)}</span>
    <DateFormPulldown slot="menu" {destroy} {date} onEnter={onChange}/>
  </PulldownMenu>
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

<style>
  .disp {
    display: inline-flex;
    justify-items: center;
  }

  .disp .repr {
    cursor: pointer;
  }

  .calendar-icon {
    color: #666;
    display: inline-block;
    margin-top: -3px;
    margin-left: 5px;
    cursor: pointer;
  }
</style>
