<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { dateParam } from "@/lib/date-param";
  import Popup from "@/lib/Popup.svelte";
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Invalid } from "@/lib/validator";
  import {
    ByoumeiMaster,
    DiseaseData,
    DiseaseEnterData,
    DiseaseExample,
    diseaseFullName,
    ShuushokugoMaster,
  } from "myclinic-model";
  import { foldSearchResult } from "../fold-search-result";
  import DiseaseSearchForm from "../search/DiseaseSearchForm.svelte";
  import DatesPopup from "./DatesPopup.svelte";
  import DatesPulldown from "./DatesPopup.svelte";

  export let patientId: number;
  export let examples: DiseaseExample[] = [];
  export let onEnter: (data: DiseaseEnterData) => void = _ => {};
  let validateStartDate: () => VResult<Date | null>;
  let startDate: Date | undefined = new Date();
  let setStartDate: (d: Date | null) => void;
  let byoumeiMaster: ByoumeiMaster | null = null;
  let adjList: ShuushokugoMaster[] = [];
  let startDateErrors: string[] = [];
  let chooseStartDateIcon: SVGSVGElement;

  function onStartDateChange(): void {
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
    setStartDate(date);
    startDate = date;
  }

  async function doEnter() {
    if (byoumeiMaster != null && startDate) {
      const data: DiseaseEnterData = {
        patientId: patientId,
        byoumeicode: byoumeiMaster.shoubyoumeicode,
        startDate: dateParam(startDate),
        adjCodes: adjList.map((m) => m.shuushokugocode),
      };
      onEnter(data);
      // const diseaseId: number = await api.enterDiseaseEx(data);
      // const d: DiseaseData = await api.getDiseaseEx(diseaseId);
      // env.addDisease(d);
      // doMode("add");
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

<div>
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
      <DatesPopup slot="icons" onSelect={doChooseStartDate} {patientId} />
    </DateFormWithCalendar>
  </div>
  <div class="command-box">
    <button on:click={doEnter} disabled={byoumeiMaster === null}>入力</button>
    <a href="javascript:void(0)" on:click={doSusp}>の疑い</a>
    <a href="javascript:void(0)" on:click={doDelAdj}>修飾語削除</a>
  </div>
  <DiseaseSearchForm {examples} {startDate} onSelect={onSearchSelect} />
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
