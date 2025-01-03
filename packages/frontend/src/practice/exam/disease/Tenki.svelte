<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  
  import {
    DiseaseEndReason,
    type DiseaseData,
    type DiseaseEndReasonType,
  } from "myclinic-model";
  import { startDateRep } from "./start-date-rep";
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import { dateToSql } from "@/lib/util";
  import type { Writable } from "svelte/store";
  import type { DiseaseEnv } from "./disease-env";
  import { incDay, lastDayOfMonth } from "myclinic-util";

  export let env: Writable<DiseaseEnv | undefined>;
  export let onEnter: (result: [number, string, string][]) => void;
  let selected: DiseaseData[] = [];
  let validateEndDate: (() => VResult<Date | null>) | undefined = undefined;
  let setEndDate: ((d: Date | null) => void) | undefined = undefined;
  let endDateErrors: string[] = [];
  let endReasons: DiseaseEndReasonType[] = [
    DiseaseEndReason.Cured,
    DiseaseEndReason.Stopped,
    DiseaseEndReason.Dead,
  ];
  let endReason: DiseaseEndReasonType = DiseaseEndReason.Cured;

  function endDateForInput(startDates: string[]): Date {
    let e: string | null = null;
    startDates.forEach((s) => {
      if (e == null || s > e) {
        e = s;
      }
    });
    if (e == null) {
      return new Date();
    } else {
      return new Date(e);
    }
  }

  function getEndDate(): Date | undefined {
    if (!validateEndDate) {
      throw new Error("uninitialized validator");
    }
    endDateErrors = [];
    const vs = validateEndDate();
    if (vs.isValid) {
      const d = vs.value;
      if (d === null) {
        endDateErrors = ["null end date"];
        return undefined;
      } else {
        return d;
      }
    } else {
      endDateErrors = errorMessagesOf(vs.errors);
      return undefined;
    }
  }

  function withEndDate(f: (d: Date) => void): void {
    const d = getEndDate();
    if (d) {
      f(d);
    }
  }

  function modifyEndDate(f: (d: Date) => Date): void {
    withEndDate((d) => {
      if (!setEndDate) {
        throw new Error("uninitialized validator");
      }
      setEndDate(f(d));
    });
  }

  function doWeekClick(event: MouseEvent): void {
    const n = event.shiftKey ? -7 : 7;
    modifyEndDate((d) => incDay(d, n));
  }

  function doTodayClick(): void {
    if (!setEndDate) {
      throw new Error("uninitialized validator");
    }
    setEndDate(new Date());
  }

  function doEndOfMonthClick(): void {
    withEndDate((endDate) => {
      if (!setEndDate) {
        throw new Error("uninitialized validator");
      }
      const lastDay = lastDayOfMonth(
        endDate.getFullYear(),
        endDate.getMonth() + 1
      );
      const d = new Date(endDate);
      d.setDate(lastDay);
      setEndDate(d);
    });
  }

  function doEndOfLastMonthClick(): void {
    if (!setEndDate) {
      throw new Error("uninitialized validator");
    }
    const d = new Date();
    d.setDate(0);
    setEndDate(d);
  }

  function onSelectChange(): void {
    if (!setEndDate) {
      throw new Error("uninitialized validator");
    }
    setEndDate(endDateForInput(selected.map((d) => d.disease.startDate)));
  }

  async function doEnter() {
    if (endDateErrors.length > 0) {
      alert(endDateErrors.map((e) => e.toString()).join("\n"));
      return;
    }
    const reasonCode = endReason.code;
    withEndDate((endDate) => {
      for (let d of selected) {
        if (dateToSql(endDate) < dateToSql(d.startDate)) {
          alert("終了日が開始日の前のものがあります。");
          return;
        }
      }
      const result: [number, string, string][] = selected.map((data) => {
        const reason = data.hasSusp
          ? DiseaseEndReason.Stopped.code
          : reasonCode;
        return [data.disease.diseaseId, dateToSql(endDate), reason];
      });
      onEnter(result);
    });
  }
</script>

<div data-cy="disease-tenki">
  {#each $env?.currentList ?? [] as d}
    {@const id = genid()}
    <div>
      <input
        type="checkbox"
        {id}
        bind:group={selected}
        value={d}
        on:change={onSelectChange}
        data-disease-id={d.disease.diseaseId}
      />
      <label for={id}
        >{d.fullName} ({startDateRep(d.disease.startDateAsDate)})</label
      >
    </div>
  {/each}
  {#if endDateErrors.length > 0}
    <div class="error">
      {#each endDateErrors as e}
        {e}
      {/each}
    </div>
  {/if}
  <div class="date-wrapper" data-cy="end-date-input">
    <DateFormWithCalendar
      init={new Date()}
      bind:validate={validateEndDate}
      bind:setValue={setEndDate}
    >
      <span slot="spacer" style:width="6px" />
    </DateFormWithCalendar>
  </div>
  <div class="date-manip">
    <a href="javascript:void(0)" on:click={doWeekClick} data-cy="week-link"
      >週</a
    >
    <a href="javascript:void(0)" on:click={doTodayClick} data-cy="today-link"
      >今日</a
    >
    <a
      href="javascript:void(0)"
      on:click={doEndOfMonthClick}
      data-cy="end-of-month-link">月末</a
    >
    <a
      href="javascript:void(0)"
      on:click={doEndOfLastMonthClick}
      data-cy="end-of-last-month-link">先月末</a
    >
  </div>
  <div class="tenki">
    {#each endReasons as reason}
      {@const id = genid()}
      <input type="radio" bind:group={endReason} value={reason} {id} />
      <label for={id}>{reason.label}</label>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter} disabled={selected.length === 0}>入力</button>
  </div>
</div>

<style>
  .error {
    margin: 10px 0;
    color: red;
  }

  .date-wrapper {
    font-size: 13px;
    margin-top: 10px;
  }

  .date-wrapper :global(input) {
    padding: 0px 2px;
  }

  .date-manip {
    margin-top: 6px;
  }

  .date-manip :global(a) {
    user-select: none;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
  }
</style>
