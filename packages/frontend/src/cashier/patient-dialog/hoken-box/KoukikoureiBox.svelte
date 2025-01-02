<script lang="ts">
  import { Hoken } from "../hoken";
  
  import { toZenkaku } from "@/lib/zenkaku";
  import { Koukikourei, Visit, dateToSqlDate } from "myclinic-model";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";
  import api from "@/lib/api";
  import { FormatDate } from "myclinic-util";

  export let koukikourei: Koukikourei;
  export let usageCount: number;
  let showUsageDates = false;
  let usageList: Visit[] = [];

  function formatValidFrom(sqldate: string): string {
    return FormatDate.f2(sqldate);
  }

  function formatValidUpto(sqldate: string): string {
    if (sqldate === "0000-00-00") {
      return "（期限なし）";
    } else {
      return FormatDate.f2(sqldate);
    }
  }

  function doOnshiConfirm() {
    const confirmDate = (koukikourei.validUpto === "0000-00-00"
      ? dateToSqlDate(new Date())
      : koukikourei.validUpto);
    const d: OnshiKakuninDialog = new OnshiKakuninDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        hoken: koukikourei,
        confirmDate,
        onOnshiNameUpdated: (updated) => {},
      },
    });
  }

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

{Hoken.koukikoureiRep(koukikourei)}
(K-{koukikourei.koukikoureiId}) 【保険者番号】{koukikourei.hokenshaBangou}
【被保険者番号】{koukikourei.hihokenshaBangou}
【負担割】{toZenkaku(koukikourei.futanWari.toString())}割 【期限開始】{formatValidFrom(
  koukikourei.validFrom
)}
【期限終了】{formatValidUpto(koukikourei.validUpto)}]
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a href="javascript:void(0)" on:click={doUsageClick} class="usage-link">【使用回数】</a>{usageCount}回
<a href="javascript:;" on:click={doOnshiConfirm}>資格確認</a>
{#if showUsageDates}
  <div class="usage-dates-box">
    {#if usageList.length === 0}
      （使用なし）
    {:else}
      {#each usageList as v (v.visitId)}
        <div>{FormatDate.f5(v.visitedAt)}</div>
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
