<script lang="ts">
  import type { Kouhi, Patient, Visit } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import { formatValidFrom, formatValidUpto } from "./misc";
  import api from "@/lib/api";
  import * as kanjidate from "kanjidate";

  export let patient: Patient | null;
  export let hoken: Hoken;
  let usageCount: number = hoken.usageCount;
  let kouhi: Kouhi = hoken.asKouhi;
  let showUsageDates = false;
  let usageList: Visit[] = [];

  async function doUsageClick() {
    if (showUsageDates) {
      showUsageDates = false;
    } else {
      usageList = await api.kouhiUsage(kouhi.kouhiId);
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
  <span>負担者番号</span>
  <span>{kouhi.futansha}</span>
  <span>受給者番号</span>
  <span>{kouhi.jukyuusha}</span>
  <span>期限開始</span>
  <span>{formatValidFrom(kouhi.validFrom)}</span>
  <span>期限終了</span>
  <span>{formatValidUpto(kouhi.validUpto)}</span>
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
