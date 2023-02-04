<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import type { Invalid } from "@/lib/validator";
  import { addDays } from "kanjidate";
  import * as kanjidate from "kanjidate";
  import {
    DiseaseEndReason,
    type DiseaseData,
    type DiseaseEndReasonType,
  } from "myclinic-model";
  import type { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";
  import { startDateRep } from "./start-date-rep";
  import api from "@/lib/api";
  import { errorMessagesOf, type VResult } from "@/lib/validation";

  export let diseases: DiseaseData[];
  export let doMode: (mode: Mode) => void;
  let selected: DiseaseData[] = [];
  let endDate: Date = new Date();
  let validateEndDate: () => VResult<Date | null>;
  let setEndDate: (d: Date | null) => void;
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

  function modifyEndDate(f: (d: Date) => Date): void {
    const d = getEndDate();
    if (d) {
      setEndDate(f(d));
    }
  }

  function doWeekClick(event: MouseEvent): void {
    const n = event.shiftKey ? -7 : 7;
    modifyEndDate((d) => addDays(d, n));
  }

  function doTodayClick(): void {
    setEndDate(new Date());
  }

  function doEndOfMonthClick(): void {
    const lastDay = kanjidate.lastDayOfMonth(
      endDate.getFullYear(),
      endDate.getMonth() + 1
    );
    const d = new Date(endDate);
    d.setDate(lastDay);
    setEndDate(d);
  }

  function doEndOfLastMonthClick(): void {
    const d = new Date();
    d.setDate(0);
    setEndDate(d);
  }

  function onSelectChange(): void {
    console.log("select change", selected);
  }

  async function doEnter() {
    if (endDateErrors.length > 0) {
      alert(endDateErrors.map((e) => e.toString()).join("\n"));
      return;
    }
    const reasonCode = endReason.code;
    for (let d of selected) {
      if (endDate < d.startDate) {
        alert("終了日が開始日の前のものがあります。");
        return;
      }
    }
    const promises = selected.map((data) => {
      const reason = data.hasSusp ? DiseaseEndReason.Stopped.code : reasonCode;
      return api.endDisease(data.disease.diseaseId, endDate, reason);
    });
    await Promise.all(promises);
    env.removeFromCurrentList(selected.map((d) => d.disease.diseaseId));
    doMode("tenki");
  }
</script>

<div>
  {#each diseases as d}
    {@const id = genid()}
    <div>
      <input type="checkbox" {id} bind:group={selected} value={d} on:change={onSelectChange}/>
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
      iconWidth="18px"
      bind:validate={validateEndDate}
      bind:setValue={setEndDate}
    >
      <span slot="spacer" style:width="6px" />
    </DateFormWithCalendar>
  </div>
  <div class="date-manip">
    <a href="javascript:void(0)" on:click={doWeekClick}>週</a>
    <a href="javascript:void(0)" on:click={doTodayClick}>今日</a>
    <a href="javascript:void(0)" on:click={doEndOfMonthClick}>月末</a>
    <a href="javascript:void(0)" on:click={doEndOfLastMonthClick}>先月末</a>
  </div>
  <div class="tenki">
    {#each endReasons as reason}
      {@const id = genid()}
      <input type="radio" bind:group={endReason} value={reason} {id} />
      <label for={id}>{reason.label}</label>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
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
