<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import CalendarIcon from "@/icons/CalendarIcon.svelte";
  import { GengouList } from "kanjidate";
  import { createEventDispatcher } from "svelte";
  import type { VResult } from "../validation";
  import { datePickerPopup } from "../date-picker/date-picker-popup";

  export let init: Date | null;
  export let datePickerDefault: () => Date = () => new Date();
  export let iconWidth: string = "1.3em";
  export let gengouList: string[] = GengouList.map((g) => g.kanji);
  let validateForm: () => VResult<Date | null>;
  export function validate(): VResult<Date | null> {
    return validateForm();
  }
  export function setValue(value: Date | null) {
    setFormValue(value);
    dispatch("value-change");
  }
  let dispatch = createEventDispatcher<{ "value-change": void }>();
  let setFormValue: (value: Date | null) => void;

  function resolvePickerDefault(): Date {
    if( init ){
      return init;
    } else {
      return datePickerDefault();
    }
    // const vs = validate();
    // if (vs.isValid) {
    //   if (vs.value === null) {
    //     return datePickerDefault();
    //   } else {
    //     return vs.value;
    //   }
    // } else {
    //   return datePickerDefault();
    // }
  }
</script>

<div>
  <div class="wrapper">
    <DateForm
      {init}
      on:value-change
      {gengouList}
      bind:validate={validateForm}
      bind:setValue={setFormValue}
    />
    <slot name="spacer" />
    <slot name="icons" />
    <CalendarIcon
      width={iconWidth}
      dy="-0.2rem"
      dx="0.2rem"
      style="cursor: pointer;"
      onClick={datePickerPopup(resolvePickerDefault(), setValue)}
    />
    <!-- <DatePicker
        slot="menu"
        {destroy}
        date={resolvePickerDefault()}
        onEnter={setValue}
      /> -->
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    justify-items: baseline;
  }
</style>
