<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { OnshiResult } from "onshi-result";
  import * as kanjidate from "kanjidate";
  import { onshiConfirm, type OnshiKakuninQuery } from "./onshi-confirm";
  import OnshiKakuninFormItem from "./OnshiKakuninFormItem.svelte";
  import { onshiDateToSqlDate } from "onshi-result/util";

  export let destroy: () => void;
  export let query: OnshiKakuninQuery;
  export let queryResult: OnshiResult | undefined = undefined;
  let querying: boolean = true;
  let error: string = "";

  startQuery();

  async function startQuery() {
    try {
      queryResult = await onshiConfirm(query);
      querying = false;
    } catch (ex) {
      querying = false;
      error = "資格確認サーバーにアクセスできませんでした。";
    }
  }

  function doClose(): void {
    destroy();
  }

  function formatOnshiDate(arg: string): string {
    const sql = onshiDateToSqlDate(arg);
    return kanjidate.format(kanjidate.f2, sql);
  }
</script>

<Dialog title="オンライン資格確認" destroy={doClose} styleWidth="300px">
  <div class="query">
    <span>保険者番号</span><span>{query.hokensha}</span>
    {#if query.kigou}
      <span>被保険者記号</span><span>{query.kigou}</span>
    {/if}
    <span>被保険者番号</span><span>{query.hihokensha}</span>
    <span>生年月日</span><span>{formatOnshiDate(query.birthdate)}</span>
    <span>確認日</span><span>{formatOnshiDate(query.confirmationDate)}</span>
  </div>
  {#if error !== ""}
    <div class="error">
      <div>{error}</div>
    </div>
  {/if}
  {#if querying}
    <div class="query-state">確認中...</div>
  {/if}
  {#if queryResult != undefined}
    {#if queryResult.isValid && queryResult.resultList.length > 0}
      <div class="result-wrapper">
        {#each queryResult.resultList as r}
          <div class="query-result">
            <OnshiKakuninFormItem result={r} />
          </div>
        {/each}
      </div>
    {:else}
      <div class="error-result">
        <div>資格確認失敗</div>
        <div>{queryResult.messageBody.qualificationValidity}</div>
        <div>{queryResult.messageBody.processingResultMessage ?? ""}</div>
      </div>
    {/if}
  {/if}
  <slot name="commands">
    <div class="commands">
      <button on:click={doClose}>閉じる</button>
    </div>
  </slot>
</Dialog>

<style>
  .query {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .query span:nth-of-type(even) {
    margin-left: 10px;
  }

  .query-state {
    margin: 10px 0;
    padding: 10px;
  }

  .commands {
    margin-top: 10px;
    text-align: right;
  }

  .query-result {
    border: 1px solid green;
    padding: 10px;
    margin: 10px 0;
  }

  .error-result {
    border: 1px solid pink;
    padding: 10px;
    margin: 10px 0;
  }

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
