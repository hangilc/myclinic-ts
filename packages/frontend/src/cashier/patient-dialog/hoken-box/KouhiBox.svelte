<script lang="ts">
  import type { Kouhi, Visit } from "myclinic-model";
  import { Hoken } from "../hoken";
  import * as kanjidate from "kanjidate";
  import api from "@/lib/api";

  export let kouhi: Kouhi;
  export let usageCount: number;
  let showUsageDates = false;
  let usageList: Visit[] = [];

  function formatValidFrom(sqldate: string): string {
    return kanjidate.format(kanjidate.f2, sqldate);
  }

  function formatValidUpto(sqldate: string): string {
    if (sqldate === "0000-00-00") {
      return "（期限なし）";
    } else {
      return kanjidate.format(kanjidate.f2, sqldate);
    }
  }

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

{Hoken.kouhiRep(kouhi)}
  (P-{kouhi.kouhiId})
【負担者】{kouhi.futansha}
【受給者】{kouhi.jukyuusha}
【期限開始】{formatValidFrom(kouhi.validFrom)}
【期限終了】{formatValidUpto(kouhi.validUpto)}] 
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a href="javascript:void(0)" on:click={doUsageClick} class="usage-link">【使用回数】</a>{usageCount}回
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
  .usage-link {
    color: black;
    cursor: pointer;
  }

  .usage-dates-box {
    margin: 10px;
    padding: 10px;
    border: 1px solid #666;
    border-radius: 4px;
  }
</style>

