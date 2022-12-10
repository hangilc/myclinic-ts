<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import type { Invalid } from "@/lib/validator";
  import { validateDisease } from "@/lib/validators/disease-validator";
  import { ByoumeiMaster, DiseaseEndReason, DiseaseExample, ShuushokugoMaster, type DiseaseData } from "myclinic-model";
  import { foldSearchResult } from "../fold-search-result";
  import DiseaseSearchForm from "../search/DiseaseSearchForm.svelte";

  export let data: DiseaseData;
  export let examples: DiseaseExample[];
  export let onCancel: () => void;
  let startDateErrors: Invalid[] = [];
  let endDateErrors: Invalid[] = [];
  const gengouList = ["平成", "令和"];

  $: console.log("data", data);

  function doEnter() {
    // const errors: Invalid[] = [];
    // let disease = validateDisease({
    //   diseaseId: data.disease.diseaseId,
    //   patientId: data.disease.patientId,
    // })
    // if( errors.length > 0 ){
    //   alert(errors.join("\n"));
    //   return;
    // }
    // if( disease.endReason == DiseaseEndReason.NotEnded ){
    //   disease = disease.clearEndDate();
    // }
    // await api.updateDiseaseEx(
    //   disease,
    //   data.shuushokugocodes
    // );
    // clearData();
  }

  function doSusp() {
    const d = data;
    d.adjList.push(ShuushokugoMaster.suspMaster);
    data = d;
    adjList = [...adjList, ShuushokugoMaster.suspMaster];
  }

  function doDelAdj() {
    adjList = [];
  }

  function doSearchSelect(r: DiseaseExample | ByoumeiMaster | ShuushokugoMaster) {
    console.log("search select", r);
    foldSearchResult(r, data.disease.startDateAsDate, 
      (m: ByoumeiMaster) => {
        const d = data;
        d.byoumeiMaster = m;
        data = d;
      }, (a: ShuushokugoMaster) => {
        const d = data;
        d.shuushokugoMasters.push(a);
        data = d;
      }, (m: ByoumeiMaster | null, as: ShuushokugoMaster[]) => {
        const d = data;
        if( m != null ){
          d.byoumeiMaster = m;
        }
        d.shuushokugoMasters.push(...as);
        data = d;
      })
  }
</script>

<div>
  <div>名前：{data.fullName}</div>
  <div class="date-wrapper start-date">
    <DateFormWithCalendar
      bind:date={data.disease.startDateAsDate}
      bind:errors={startDateErrors}
      {gengouList}
    />
  </div>
  <div class="date-wrapper end-date">
    <DateFormWithCalendar
      bind:date={data.disease.endDateAsDate}
      bind:errors={endDateErrors}
      isNullable={true}
      {gengouList}
    />
  </div>
  <div class="end-reason">
    {#each Object.values(DiseaseEndReason) as reason}
      {@const id = genid()}
      <input type="radio" bind:group={data.endReason} value={reason} {id} />
      <label for={id}>{reason.label}</label>
    {/each}
  </div>
  <div>
    <button on:click={doEnter}>入力</button>
    <a href="javascript:void(0)" on:click={onCancel}>キャンセル</a>
  </div>
  <div class="command-box">
    <button on:click={doEnter}>入力</button>
    <a href="javascript:void(0)" on:click={doSusp}>の疑い</a>
    <a href="javascript:void(0)" on:click={doDelAdj}>修飾語削除</a>
  </div>
  <DiseaseSearchForm {examples} startDate={data.disease.startDateAsDate} onSelect={doSearchSelect}/>
</div>

<style>
  .date-wrapper {
    font-size: 13px;
    margin-top: 4px;
  }

  .date-wrapper :global(.calendar-icon) {
    margin-left: 6px;
    font-size: 16px;
    position: relative;
    top: 1px;
  }

  .end-reason {
    font-size: 13px;
  }
</style>
