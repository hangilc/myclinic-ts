<script lang="ts">
  import { dateToSqlDate, Visit, type Shahokokuho } from "myclinic-model";
  import { Hoken } from "../hoken";
  import * as kanjidate from "kanjidate";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";
  import api from "@/lib/api";

  export let shahokokuho: Shahokokuho;
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

  function doOnshiConfirm() {
    const confirmDate = (shahokokuho.validUpto === "0000-00-00"
      ? dateToSqlDate(new Date())
      : shahokokuho.validUpto);
    const d: OnshiKakuninDialog = new OnshiKakuninDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        hoken: shahokokuho,
        confirmDate,
        onOnshiNameUpdated: (updated) => {},
      },
    });
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

<sapn data-cy="rep">{Hoken.shahokokuhoRep(shahokokuho)}</sapn>
(S-{shahokokuho.shahokokuhoId}) 【保険者番号】<span data-cy="hokensha-bangou"
  >{shahokokuho.hokenshaBangou}</span
>
【被保険者記号】<span data-cy="hihokensha-kigou"
  >{shahokokuho.hihokenshaKigou}</span
>
【被保険者番号】<span data-cy="hihokensha-bangou"
  >{shahokokuho.hihokenshaBangou}</span
>
【枝番】<span data-cy="edaban">{shahokokuho.edaban}</span>
【本人・家族】<span data-cy="honnin">{shahokokuho.honnninKazokuType.rep}</span>
【期限開始】<span data-cy="valid-from"
  >{formatValidFrom(shahokokuho.validFrom)}</span
>
【期限終了】<span data-cy="valid-upto"
  >{formatValidUpto(shahokokuho.validUpto)}</span
>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a href="javascript:void(0)" on:click={doUsageClick} class="usage-link"
  >【使用回数】<span data-cy="usage-count">{usageCount}</span>回</a
>
<a href="javascript:;" on:click={doOnshiConfirm}>資格確認</a>
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
