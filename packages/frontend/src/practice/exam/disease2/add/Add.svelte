<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { dateParam } from "@/lib/date-param";
  import type { Invalid } from "@/lib/validator";
  import {
    ByoumeiMaster,
    DiseaseData,
    DiseaseEnterData,
    DiseaseExample,
    diseaseFullName,
    ShuushokugoMaster,
  } from "myclinic-model";
  import type { DiseaseEnv } from "../disease-env";
  import { foldSearchResult } from "../fold-search-result";
  import type { Mode } from "../mode";
  import DiseaseSearchForm from "../search/DiseaseSearchForm.svelte";
  import DatesPulldown from "./DatesPulldown.svelte";

  export let env: DiseaseEnv;
  export let doMode: (mode: Mode) => void;
  let byoumeiMaster: ByoumeiMaster | null = null;
  let adjList: ShuushokugoMaster[] = [];
  let startDate: Date = new Date();
  let startDateErrors: Invalid[] = [];
  let chooseStartDateIcon: SVGSVGElement;

  async function doChooseStartDate() {
    const visits = await api.listVisitByPatientReverse(
      env.patient.patientId,
      0,
      10
    );
    const visitDates = visits.map(
      (v) => new Date(v.visitedAt.substring(0, 10))
    );
    const d: DatesPulldown = new DatesPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        dates: visitDates,
        onSelect: (d: Date) => (startDate = d),
      },
    });
  }

  async function doEnter() {
    if (byoumeiMaster != null) {
      if (startDateErrors.length > 0) {
        alert(
          "エラー：\n" + startDateErrors.map((e) => e.toString()).join("\n")
        );
        return;
      }
      const data: DiseaseEnterData = {
        patientId: env.patient.patientId,
        byoumeicode: byoumeiMaster.shoubyoumeicode,
        startDate: dateParam(startDate),
        adjCodes: adjList.map((m) => m.shuushokugocode),
      };
      const diseaseId: number = await api.enterDiseaseEx(data);
      const d: DiseaseData = await api.getDiseaseEx(diseaseId);
      env.addDisease(d);
      doMode("add");
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
    名称：{diseaseFullName(byoumeiMaster, adjList)}
  </div>
  <div class="start-date-wrapper">
    <DateFormWithCalendar
      bind:date={startDate}
      bind:errors={startDateErrors}
      isNullable={false}
    >
      <svelte:fragment slot="icons">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          on:click={doChooseStartDate}
          bind:this={chooseStartDateIcon}
          class="choice-icon"
          width="1.2em"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </svelte:fragment>
    </DateFormWithCalendar>
  </div>
  <div class="command-box">
    <button on:click={doEnter}>入力</button>
    <a href="javascript:void(0)" on:click={doSusp}>の疑い</a>
    <a href="javascript:void(0)" on:click={doDelAdj}>修飾語削除</a>
  </div>
  <DiseaseSearchForm
    examples={env.examples}
    {startDate}
    onSelect={onSearchSelect}
  />
</div>

<style>
  .start-date-wrapper {
    font-size: 13px;
    margin: 4px 0;
  }

  .choice-icon {
    color: gray;
    cursor: pointer;
  }

  .command-box {
    margin: 4px 0;
  }
</style>
