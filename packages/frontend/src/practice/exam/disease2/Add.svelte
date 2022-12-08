<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import type { Invalid } from "@/lib/validator";
  import { ShuushokugoMaster, type ByoumeiMaster } from "myclinic-model";
  import type { DiseaseEnv } from "./disease-env";
  import DiseaseSearchForm from "./search/DiseaseSearchForm.svelte";

  export let env: DiseaseEnv | undefined;
  let byoumeiMaster: ByoumeiMaster | null = null;
  let adjList: ShuushokugoMaster[] = [];
  let startDate: Date = new Date();
  let startDateErrors: Invalid[] = [];
  let chooseStartDateIcon: SVGSVGElement;

  function doChooseStartDate() {

  }

  function doEnter() {

  }

  function doSusp() {
    adjList.push(ShuushokugoMaster.suspMaster);
  }

  function doDelAdj() {
    adjList = [];
  }

  function doSearch() {

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
  <DiseaseSearchForm />
</div>

<style>
  .choice-icon {
    color: gray;
    cursor: pointer;
  }
</style>