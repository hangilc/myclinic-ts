<script lang="ts">
  import { DateWrapper, GengouList } from "myclinic-util";
  import { DateInput as ValidationDateInput } from "myclinic-model";
  import { sqlDateToDate } from "../date-util";

  export let initValue: Date | string | undefined = undefined;
  export let gengouList: string[] = GengouList.map((g) => g.name);
  export function getInputs(): ValidationDateInput {
    return new ValidationDateInput({
      gengou,
      nen,
      month,
      day,
    });
  }
  let gengou: string = "";
  let nen: string = "";
  let month: string = "";
  let day: string = "";

  init();

  function init() {
    if (initValue == null || initValue == "0000-00-00") {
      gengou = gengouList.length > 0 ? gengouList[0] : "";
    } else {
      let d: Date;
      if (initValue instanceof Date) {
        d = initValue;
      } else {
        d = sqlDateToDate(initValue);
      }
      // const k = new KanjiDate(d);
      const k = DateWrapper.from(d);
      gengou = k.getGengou();
      nen = k.getNen().toString();
      month = k.getMonth().toString();
      day = k.getDay().toString();
    }
  }

  function doMonthClick() {}

  function doNenClick() {}

  function doDayClick() {}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="top date-form">
  <div class="inputs">
    <select bind:value={gengou} class="gengou" data-cy="gengou-select">
      {#each gengouList as g}
        <option data-cy="gengou-option">{g}</option>
      {/each}
    </select>
    <input type="text" class="nen" bind:value={nen} data-cy="nen-input" />
    <span on:click={doNenClick} class="nen-span">年</span>
    <input type="text" class="month" bind:value={month} data-cy="month-input" />
    <span on:click={doMonthClick} class="month-span">月</span>
    <input type="text" class="day" bind:value={day} data-cy="day-input" />
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
