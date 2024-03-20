<script lang="ts">
  import { toZenkaku } from "@/lib/zenkaku";
  import type { Koukikourei, Patient, Visit } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import { formatValidFrom, formatValidUpto } from "./misc";
  import api from "@/lib/api";
  import * as kanjidate from "kanjidate";

  export let patient: Patient | null;
  export let hoken: Hoken;
  let usageCount: number = hoken.usageCount;
  let koukikourei: Koukikourei = hoken.asKoukikourei;
  let showUsageDates = false;
  let usageList: Visit[] = [];

  async function doUsageClick() {
    if (showUsageDates) {
      showUsageDates = false;
    } else {
      usageList = await api.koukikoureiUsage(koukikourei.koukikoureiId);
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
  <span>{koukikourei.hokenshaBangou}</span>
  <span>被保険者番号</span>
  <span>{koukikourei.hihokenshaBangou}</span>
  <span>負担割</span>
  <span>{toZenkaku(koukikourei.futanWari.toString())}割</span>
  <span>期限開始</span>
  <span>{formatValidFrom(koukikourei.validFrom)}</span>
  <span>期限終了</span>
  <span>{formatValidUpto(koukikourei.validUpto)}</span>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <a on:click={doUsageClick} class="usage-link"><span>使用回数</span></a>
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