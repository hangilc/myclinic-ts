<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { dateParam } from "@/lib/date-param";
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import {
    ByoumeiMaster,
    DiseaseEnterData,
    DiseaseExample,
    diseaseFullName,
    ShuushokugoMaster,
  } from "myclinic-model";
  import { foldSearchResult } from "../fold-search-result";
  import DiseaseSearchForm from "../search/DiseaseSearchForm.svelte";
  import DatesPopup from "./DatesPopup.svelte";
  import type { DiseaseEnv } from "../disease-env";
  import type { Writable } from "svelte/store";

  export let env: Writable<DiseaseEnv | undefined>;
  export let onEnter: (data: DiseaseEnterData) => void = _ => {};
  let validateStartDate: (() => VResult<Date | null>) | undefined = undefined;
  let startDate: Date | undefined = new Date();
  let setStartDate: ((d: Date | null) => void) | undefined;
  let byoumeiMaster: ByoumeiMaster | null = null;
  let adjList: ShuushokugoMaster[] = [];
  let startDateErrors: string[] = [];

  function onStartDateChange(): void {
    if( !validateStartDate ){
      throw new Error("uninitialized validator");
    }
    startDateErrors = [];
    const r = validateStartDate();
    if( r.isValid ){
      if( r.value != null ){
        startDate = r.value;
      } else {
        startDate = undefined;
        startDateErrors = ["null start date"];
      }
    } else {
      startDate = undefined;
      startDateErrors = errorMessagesOf(r.errors);
    }
  }

  function doChooseStartDate(date: Date): void {
    if( !setStartDate ){
      throw new Error("uninitialized validator");
    }
    setStartDate(date);
    startDate = date;
  }

  async function doEnter() {
    const patientId = $env?.patient.patientId;
    if (byoumeiMaster != null && startDate && patientId) {
      const data: DiseaseEnterData = {
        patientId: patientId,
        byoumeicode: byoumeiMaster.shoubyoumeicode,
        startDate: dateParam(startDate),
        adjCodes: adjList.map((m) => m.shuushokugocode),
      };
      byoumeiMaster = null;
      adjList = [];
      onEnter(data);
    }
  }

  function doSusp() {
    adjList = [...adjList, ShuushokugoMaster.suspMaster];
  }

  function doDelAdj() {
    adjList = [];
  }

  function onSearchSelect(
    r: ByoumeiMaster | ShuushokugoMaster | DiseaseExample
  ): void {
    if (!startDate) {
      return;
    }
    foldSearchResult(
      r,
      startDate,
      (m: ByoumeiMaster) => {
        byoumeiMaster = m;
      },
      (a: ShuushokugoMaster) => {
        const cur = adjList;
        cur.push(a);
        adjList = cur;
      },
      (m: ByoumeiMaster | null, adjs: ShuushokugoMaster[]) => {
        if (m != null) {
          byoumeiMaster = m;
        }
        const cur: ShuushokugoMaster[] = adjList;
        cur.push(...adjs);
        adjList = cur;
      }
    );
  }
</script>

<div data-cy="disease-add">
  <div>
    名称：<span data-cy="disease-name"
      >{diseaseFullName(byoumeiMaster, adjList)}</span
    >
  </div>
  {#if startDateErrors.length > 0}
    <div class="error">
      {#each startDateErrors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <div class="start-date-wrapper">
    <DateFormWithCalendar
      init={startDate ?? new Date()}
      bind:validate={validateStartDate}
      bind:setValue={setStartDate}
      on:value-change={onStartDateChange}
    >
      <DatesPopup slot="icons" onSelect={doChooseStartDate} patientId={$env?.patient.patientId ?? 0} />
    </DateFormWithCalendar>
  </div>
  <div class="command-box">
    <button on:click={doEnter} disabled={byoumeiMaster === null}>入力</button>
    <a href="javascript:void(0)" on:click={doSusp}>の疑い</a>
    <a href="javascript:void(0)" on:click={doDelAdj}>修飾語削除</a>
  </div>
  <DiseaseSearchForm {startDate} onSelect={onSearchSelect} />
</div>

<style>
  .error {
    margin: 10px 0;
    color: red;
  }

  .start-date-wrapper {
    font-size: 13px;
    margin: 4px 0;
  }

  .command-box {
    margin: 4px 0;
  }
</style>
