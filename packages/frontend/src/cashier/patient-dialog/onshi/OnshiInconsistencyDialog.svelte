<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import * as kanjidate from "kanjidate";
  import OnshiKakuninFormItem from "@/lib/OnshiKakuninFormItem.svelte";
  import { onshiDateToSqlDate } from "onshi-result/util";
  import type { ResultItem } from "onshi-result/dist/ResultItem";
  import type { OnshiInconsistency } from "@/lib/onshi-consistency";

  export let destroy: () => void;
  export let resultItem: ResultItem;
  export let inconsistencies: OnshiInconsistency[];

  function doClose(): void {
    destroy();
  }

  function formatOnshiDate(arg: string): string {
    const sql = onshiDateToSqlDate(arg);
    return kanjidate.format(kanjidate.f2, sql);
  }
</script>

<Dialog title="オンライン資格確認不一致" destroy={doClose} styleWidth="300px">
  {#if inconsistencies.length > 0}
    <div class="error">
      {#each inconsistencies as error}<div>{error.toString()}</div>{/each}
    </div>
  {/if}
  <div class="result-wrapper">
    <div class="query-result">
      <OnshiKakuninFormItem result={resultItem} />
    </div>
  </div>
  <slot name="commands">
    <div class="commands">
      <button on:click={doClose}>閉じる</button>
    </div>
  </slot>
</Dialog>

<style>
  .commands {
    margin-top: 10px;
    text-align: right;
  }

  .query-result {
    border: 1px solid green;
    padding: 10px;
    margin: 10px 0;
  }

  /* .error-result {
    border: 1px solid pink;
    padding: 10px;
    margin: 10px 0;
    color: red;
  } */

  .error {
    border: 1px solid red;
    padding: 10px;
    color: red;
    margin: 10px 0;
  }

  .result-wrapper {
    max-height: 300px;
    overflow-y: auto;
    padding: 6px;
  }
</style>
