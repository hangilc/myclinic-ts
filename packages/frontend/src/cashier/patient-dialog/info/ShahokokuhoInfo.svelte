<script lang="ts">
  import type { Patient, Shahokokuho, Visit } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import { toZenkaku } from "@/lib/zenkaku";
  import { formatValidFrom, formatValidUpto } from "./misc";
  import api from "@/lib/api";
  import * as kanjidate from "kanjidate";

  export let patient: Patient | null;
  export let hoken: Hoken;
  let shahokokuho: Shahokokuho = hoken.asShahokokuho;
  let usageCount: number = hoken.usageCount;
  let showUsageDates = false;
  let usageList: Visit[] = [];

  function formatKourei(kourei: number): string {
    if (kourei === 0) {
      return "高齢でない";
    } else {
      return `${toZenkaku(kourei.toString())}割`;
    }
  }

  async function doUsageClick() {
    if (showUsageDates) {
      showUsageDates = false;
    } else {
      usageList = await api.shahokokuhoUsage(shahokokuho.shahokokuhoId);
      usageList.reverse();
      showUsageDates = true;
    }
  }
</script>

<div class="panel">
  {#if patient}
    <span>({patient.patientId})</span>
    <span>{patient.fullName(" ")}</span>
  {/if}
  <span>保険者番号</span>
  <span>{shahokokuho.hokenshaBangou}</span>
  <span>記号・番号</span>
  <span>
    {#if shahokokuho.hihokenshaKigou !== ""}
      {shahokokuho.hihokenshaKigou}・
    {/if}
    {shahokokuho.hihokenshaBangou}
  </span>
  <span>枝番</span>
  <span>{shahokokuho.edaban}</span>
  <span>本人・家族</span>
  <span>{shahokokuho.honnninKazokuType.rep}</span>
  <span>期限開始</span>
  <span>{formatValidFrom(shahokokuho.validFrom)}</span>
  <span>期限終了</span>
  <span>{formatValidUpto(shahokokuho.validUpto)}</span>
  <span>高齢</span>
  <span>{formatKourei(shahokokuho.koureiStore)}</span>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <a href="javascript:void(0)" on:click={doUsageClick} class="usage-link"><span>使用回数</span></a>
  <span>{usageCount}回</span>
</div>
{#if showUsageDates}
  <div class="usage-dates-box">
    {#if usageList.length === 0}
      （使用なし）
    {:else}
      {#each usageList as v (v.visitId)}
        <div>{kanjidate.format(kanjidate.f5, v.visitedAt)}</div>
      {/each}
    {/if}
  </div>
{/if}

<style>
  .panel {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .panel > *:nth-child(odd) {
    display: flex;
    align-items: center;
    justify-content: right;
    margin-right: 6px;
  }
  .usage-link {
    color: black;
    cursor: pointer;
    user-select: none;
  }

  .usage-dates-box {
    margin: 10px;
    padding: 10px;
    border: 1px solid #666;
    border-radius: 4px;
  }
</style>
