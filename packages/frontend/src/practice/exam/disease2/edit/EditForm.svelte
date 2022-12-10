<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import type { Invalid } from "@/lib/validator";
  import { validateDisease } from "@/lib/validators/disease-validator";
  import {
    ByoumeiMaster,
    Disease,
    DiseaseEndReason,
    DiseaseEndReasonType,
    DiseaseExample,
    diseaseFullName,
    ShuushokugoMaster,
    type DiseaseData,
  } from "myclinic-model";
  import { foldSearchResult } from "../fold-search-result";
  import DiseaseSearchForm from "../search/DiseaseSearchForm.svelte";

  export let data: DiseaseData | null;
  export let examples: DiseaseExample[];
  export let onEnter: (entered: DiseaseData) => void;
  export let onCancel: () => void;
  let byoumeiMaster: ByoumeiMaster | null = null;
  let shuushokugoMasters: ShuushokugoMaster[] = [];
  let startDate: Date | null = null;
  let startDateErrors: Invalid[] = [];
  let endDate: Date | null = null;
  let endDateErrors: Invalid[] = [];
  let endReason: DiseaseEndReasonType = DiseaseEndReason.Cured;

  let fullName: string = "";
  $: fullName = diseaseFullName(byoumeiMaster, shuushokugoMasters);
  const gengouList = ["平成", "令和"];

  $: initFormValues(data);

  function initFormValues(data: DiseaseData | null): void {
    if (data == null) {
      clear();
    } else {
      byoumeiMaster = data.byoumeiMaster;
      shuushokugoMasters = data.shuushokugoMasters;
      startDate = data.disease.startDateAsDate;
      startDateErrors = [];
      endDate = data.disease.endDateAsDate;
      endDateErrors = [];
      endReason = data.disease.endReason;
    }
  }

  function clear(): void {
    byoumeiMaster = null;
    shuushokugoMasters = [];
    startDate = null;
    startDateErrors = [];
    endDate = null;
    endDateErrors = [];
    endReason = DiseaseEndReason.Cured;
  }

  async function doEnter() {
    if (data == null) {
      return;
    }
    const dr: Disease | Invalid[] = validateDisease({
      diseaseId: data.disease.diseaseId,
      patientId: data.disease.patientId,
      shoubyoumeicode: byoumeiMaster?.shoubyoumeicode ?? 0,
      startDate,
      startDateErrors,
      endDate,
      endDateErrors: [],
      endReason,
    });
    if (dr instanceof Disease) {
      const ok = await api.updateDiseaseEx(
        dr,
        shuushokugoMasters.map((m) => m.shuushokugocode)
      );
      if (!ok) {
        alert("症病名の更新に失敗しました。");
        return;
      } else {
        const entered = await api.getDiseaseEx(data.disease.diseaseId);
        onEnter(entered);
      }
    }
  }

  function doSusp() {
    const c = shuushokugoMasters;
    c.push(ShuushokugoMaster.suspMaster);
    shuushokugoMasters = c;
  }

  function doDelAdj() {
    shuushokugoMasters = [];
  }

  function doSearchSelect(
    r: DiseaseExample | ByoumeiMaster | ShuushokugoMaster
  ) {
    if (data != null) {
      foldSearchResult(
        r,
        data.disease.startDateAsDate,
        (m: ByoumeiMaster) => {
          byoumeiMaster = m;
        },
        (a: ShuushokugoMaster) => {
          const c = shuushokugoMasters;
          c.push(a);
          shuushokugoMasters = c;
        },
        (m: ByoumeiMaster | null, as: ShuushokugoMaster[]) => {
          if (m != null) {
            byoumeiMaster = m;
          }
          const c = shuushokugoMasters;
          c.push(...as);
          shuushokugoMasters = c;
        }
      );
    }
  }
</script>

{#if data != null}
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
  <DiseaseSearchForm
    {examples}
    startDate={data.disease.startDateAsDate}
    onSelect={doSearchSelect}
  />
</div>
{:else}
（病名未選択）
{/if}

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
