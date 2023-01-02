<script lang="ts">
  import * as kanjidate from "kanjidate";
  import DateFormPulldown from "../date-form/DateFormPulldown.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import Popup from "../Popup.svelte";
  import CalendarIcon from "../../icons/CalendarIcon.svelte";

  export let date: Date | null;
  export let format: (date: Date | null) => string = (date: Date | null) => {
    if (date == null) {
      return "（未設定）";
    } else {
      return kanjidate.format(kanjidate.f2, date);
    }
  };
  export let datePickerDefault: () => Date = () => new Date();
  export let onChange: (date: Date | null) => void = (_) => {};

</script>

<div class="disp">
  <Popup let:destroy let:trigger>
    <span class="repr" on:click={trigger}>{format(date)}</span>
    <DateFormPulldown slot="menu" {destroy} {date} onEnter={onChange} />
  </Popup>
  <slot name="icons" />
  <Popup let:destroy let:triggerClick>
    <CalendarIcon dy="-4px" dx="4px" onClick={triggerClick}/>
    <DatePicker
      slot="menu"
      date={date || datePickerDefault()}
      {destroy}
      onEnter={onChange}
    />
  </Popup>
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
    color: #999;
    display: inline-block;
    margin-top: -3px;
    margin-left: 5px;
    cursor: pointer;
  }
</style>
