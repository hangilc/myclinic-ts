<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import Popup from "../Popup.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import CalendarIcon from "@/icons/CalendarIcon.svelte";
  import { GengouList } from "kanjidate";
  import { createEventDispatcher } from "svelte";
  import type { VResult } from "../validation";
  
  export let init: Date | null;
  export let datePickerDefault: () => Date = () => new Date();
  export let iconWidth: string = "1.3em";
  export let gengouList: string[] = GengouList.map(g => g.kanji);
  export function validate(): VResult<Date | null> { return validateForm(); }
  export function setValue(value: Date | null) {
    setFormValue(value);
    dispatch("value-change");
  }
  let dispatch = createEventDispatcher<{ "value-change": void }>();
  let validateForm: () => VResult<Date | null>;
  let setFormValue: (value: Date | null) => void;

  function resolvePickerDefault(): Date {
    const vs = validate();
    if( vs.isValid ){
      if( vs.value === null ){
        return datePickerDefault();
      } else {
        return vs.value;
      }
    } else {
      return datePickerDefault();
    }
  }
</script>

<div>
  <div class="wrapper">
    <DateForm {init} on:value-change {gengouList} bind:validate={validateForm} bind:setValue={setFormValue}/>
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
        date={resolvePickerDefault()}
        onEnter={setValue}
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
