<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { dateParam } from "@/lib/date-param";
  import Popup from "@/lib/Popup.svelte";
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
  import DatesPopup from "./DatesPopup.svelte";
  import DatesPulldown from "./DatesPopup.svelte";

  export let env: DiseaseEnv;
  export let doMode: (mode: Mode) => void;
  let byoumeiMaster: ByoumeiMaster | null = null;
  let adjList: ShuushokugoMaster[] = [];
  let startDate: Date = new Date();
  let startDateErrors: Invalid[] = [];
  let chooseStartDateIcon: SVGSVGElement;

  function doChooseStartDate(date: Date): void {
    startDate = date;
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
    <DatesPopup slot="icons" onSelect={doChooseStartDate} patientId={env.patient.patientId}/>
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

  .command-box {
    margin: 4px 0;
  }
</style>
