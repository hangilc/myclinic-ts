<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { dateParam } from "@/lib/date-param";
  import type { Invalid } from "@/lib/validator";
  import { ByoumeiMaster, DiseaseData, DiseaseEnterData, DiseaseExample, ShuushokugoMaster } from "myclinic-model";
  import type { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";
  import DiseaseSearchForm from "./search/DiseaseSearchForm.svelte";

  export let env: DiseaseEnv | undefined;
  export let doMode: (mode: Mode) => void;
  let byoumeiMaster: ByoumeiMaster | null = null;
  let adjList: ShuushokugoMaster[] = [];
  let startDate: Date = new Date();
  let startDateErrors: Invalid[] = [];
  let chooseStartDateIcon: SVGSVGElement;

  function doChooseStartDate() {

  }

  async function doEnter() {
    if (env != undefined && byoumeiMaster != null) {
      if (startDateErrors.length > 0) {
        alert("エラー：\n" + startDateErrors.map(e => e.toString()).join("\n"));
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

  async function onSearchSelect(r: ByoumeiMaster | ShuushokugoMaster | DiseaseExample) {
    if (ByoumeiMaster.isByoumeiMaster(r)) {
      byoumeiMaster = r;
    } else if (ShuushokugoMaster.isShuushokugoMaster(r)) {
      const cur = adjList;
      cur.push(r);
      adjList = cur;
    } else if (DiseaseExample.isDiseaseExample(r)) {
      if (r.byoumei != null) {
        const m = await api.resolveByoumeiMasterByName(r.byoumei, startDate);
        if (m != null) {
          byoumeiMaster = m;
        } else {
          throw new Error("Cannot resolve byoumei: " + r.byoumei);
        }
      }
      [...r.preAdjList, ...r.postAdjList].forEach(async (name) => {
        const m = await api.resolveShuushokugoMasterByName(name, startDate);
        if (m != null) {
          const cur = adjList;
          cur.push(m);
          adjList = cur;
        } else {
          throw new Error("Cannot resolve adj name: " + r.byoumei);

        }
      });
    }
  }
</script>

<div>
  <div>
    名称：{byoumeiMaster?.name || ""}{adjList.map((m) => m.name).join("")}
  </div>
  <div>
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
  <div>
    <button on:click={doEnter}>入力</button>
    <a href="javascript:void(0)" on:click={doSusp}>の疑い</a>
    <a href="javascript:void(0)" on:click={doDelAdj}>修飾語削除</a>
  </div>
  <DiseaseSearchForm examples={env?.examples ?? []} {startDate} onSelect={onSearchSelect}/>
</div>

<style>
  .choice-icon {
    color: gray;
    cursor: pointer;
  }
</style>