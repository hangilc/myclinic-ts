<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import { GengouList } from "myclinic-util";
  import { createEventDispatcher } from "svelte";
  import type { VResult } from "../validation";
  import { datePickerPopup } from "../date-picker/date-picker-popup";

  export let init: Date | null;
  export let datePickerDefault: () => Date = () => new Date();
  export let gengouList: string[] = GengouList.map((g) => g.name);
  let validateForm: (() => VResult<Date | null>) | undefined;
  export function validate(): VResult<Date | null> {
    if (validateForm) {
      return validateForm();
    } else {
      throw new Error("uninitialized validateForm");
    }
  }
  export function setValue(value: Date | null) {
    if (setFormValue) {
      setFormValue(value);
      dispatch("value-change");
    } else {
      throw new Error("uninitialized setValue");
    }
  }
  let dispatch = createEventDispatcher<{ "value-change": void }>();
  let setFormValue: ((value: Date | null) => void) | undefined;

  function resolvePickerDefault(): Date {
    const vs = validate();
    if (vs.isValid) {
      if (vs.value === null) {
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
    <DateForm
      {init}
      on:value-change
      {gengouList}
      bind:validate={validateForm}
      bind:setValue={setFormValue}
    />
    <slot name="spacer" />
    <slot name="icons" />
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="gray"
      width="1.3em"
      on:click={datePickerPopup(resolvePickerDefault, setValue)}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    justify-items: baseline;
  }

  svg {
    position: relative;
    top: -0.1rem;
    margin-left: 3px;
  }
</style>
