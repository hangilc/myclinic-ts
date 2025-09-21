<script lang="ts">
  import { source, toInt, validResult, VResult } from "../validation";
  import { validateWareki } from "../validators/wareki-validator";
  import { createEventDispatcher } from "svelte";
  import { DateWrapper, GengouList } from "myclinic-util";

  export let init: Date | null;
  export let gengouList: string[] = GengouList.map((g) => g.name);
  export function setValue(value: Date | null): void {
    updateValues(value);
  }
  let dispatch = createEventDispatcher<{ "value-change": void }>();
  let gengou: string = gengouList.length > 0 ? gengouList[0] : "";
  let nen: string;
  let month: string;
  let day: string;

  $: updateValues(init);

  function updateValues(date: Date | null): void {
    if (date === null) {
      nen = "";
      month = "";
      day = "";
    } else {
      // const k = new kanjidate.KanjiDate(date);
      const k = DateWrapper.from(date);
      gengou = k.getGengou();
      nen = k.getNen().toString();
      month = k.getMonth().toString();
      day = k.getDay().toString();
    }
  }

  export function validate(): VResult<Date | null> {
    if (nen === "" && month === "" && day === "") {
      return validResult(null);
    } else {
      return validateWareki({
        gengou: source(gengou),
        nen: source(nen).validate(toInt),
        month: source(month).validate(toInt),
        day: source(day).validate(toInt),
      });
    }
  }

  function modifyDateFromIntern(f: (d: Date) => Date): void {
    const vs = validate();
    if (vs.isValid) {
      if (vs.value !== null) {
        const value = f(vs.value);
        updateValues(value);
        dispatch("value-change");
      }
    }
  }

  function handleUserInput(): void {
    const vs = validate();
    if (vs.isValid) {
      updateValues(vs.value);
    }
    dispatch("value-change");
  }

  function doInputChange(): void {
    handleUserInput();
  }

  function doModify(f: (d: Date) => Date): void {
    modifyDateFromIntern(f);
  }

  function doNenClick(event: MouseEvent): void {
    // doModify((d) => addYears(d, event.shiftKey ? -1 : 1));
    doModify((d) => DateWrapper.from(d).incYear(event.shiftKey ? -1 : 1).asDate());
  }

  function doMonthClick(event: MouseEvent): void {
    // doModify((d) => addMonths(d, event.shiftKey ? -1 : 1));
    doModify((d) => DateWrapper.from(d).incMonth(event.shiftKey ? -1 : 1).asDate());
  }

  function doDayClick(event: MouseEvent): void {
    // doModify((d) => addDays(d, event.shiftKey ? -1 : 1));
    doModify((d) => DateWrapper.from(d).incDay(event.shiftKey ? -1 : 1).asDate());
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="top date-form">
  <div class="inputs">
    <select
      bind:value={gengou}
      class="gengou"
      on:change={doInputChange}
      data-cy="gengou-select"
    >
      {#each gengouList as g}
        <option data-cy="gengou-option">{g}</option>
      {/each}
    </select>
    <input
      type="text"
      class="nen"
      bind:value={nen}
      on:change={doInputChange}
      data-cy="nen-input"
    />
    <span on:click={doNenClick} class="nen-span">年</span>
    <input
      type="text"
      class="month"
      bind:value={month}
      on:change={doInputChange}
      data-cy="month-input"
    />
    <span on:click={doMonthClick} class="month-span">月</span>
    <input
      type="text"
      class="day"
      bind:value={day}
      on:change={doInputChange}
      data-cy="day-input"
    />
    <span on:click={doDayClick} class="day-span">日</span>
  </div>
</div>

<style>
  .top {
    display: inline-block;
  }

  .inputs {
    display: flex;
    align-items: center;
  }

  .gengou {
    font-size: 1em;
    padding: 1px;
    margin-right: 2px;
  }

  .inputs span {
    margin-left: 1px;
  }

  .nen {
    margin-left: 1px;
  }

  .month,
  .day {
    margin-left: 2px;
  }

  .nen,
  .month,
  .day {
    width: 1.5em;
    font-size: 1em;
    padding: 0 1px;
  }

  .nen-span,
  .month-span,
  .day-span {
    cursor: pointer;
    user-select: none;
  }
</style>
