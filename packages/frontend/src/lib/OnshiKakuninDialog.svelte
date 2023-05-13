<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { OnshiResult } from "onshi-result";
  import * as kanjidate from "kanjidate";
  import OnshiKakuninFormItem from "./OnshiKakuninFormItem.svelte";
  import { onshiDateToSqlDate } from "onshi-result/util";
  import type { Koukikourei, Shahokokuho } from "myclinic-model";
  import { onshiConfirmHoken } from "./onshi-query-helper";
  import type { OnshiKakuninQuery } from "./onshi-confirm";

  export let destroy: () => void;
  export let hoken: Shahokokuho | Koukikourei;
  export let confirmDate: string;
  let result: OnshiResult | undefined = undefined;
  let errors: string[] = [];
  let announce: string = "";
  let query: OnshiKakuninQuery | undefined = undefined;

  startQuery();

  async function startQuery() {
    announce = "問い合わせ中";
    try {
      const [r, e] = await onshiConfirmHoken(hoken, confirmDate, {
        queryCallback: (q) => (query = q),
      });
      announce = "";
      if (e.length > 0) {
        errors = e.map((e) => e.toString());
      } 
      if( r ) {
        result = r;
      }
    } catch (ex: any) {
      errors = ["資格確認サーバー問い合わせエラー。", ex.toString()];
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
    {#if query}
      <span>保険者番号</span><span>{query.hokensha}</span>
      {#if query.kigou}
        <span>被保険者記号</span><span>{query.kigou}</span>
      {/if}
      <span>被保険者番号</span><span>{query.hihokensha}</span>
      <span>生年月日</span><span>{formatOnshiDate(query.birthdate)}</span>
      <span>確認日</span><span>{formatOnshiDate(query.confirmationDate)}</span>
    {/if}
  </div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as error}<div>{error}</div>{/each}
    </div>
  {/if}
  {#if announce}<div class="announce">{announce}</div>{/if}
  {#if result && result.resultList.length === 1}
    <div class="result-wrapper">
      <div class="query-result">
        <OnshiKakuninFormItem result={result.resultList[0]} />
      </div>
    </div>
  {/if}
  <!-- {#if errors.length > 0}
    <div class="error-result">
      <div>資格確認失敗</div>
      {#each errors as error}<div>{error}</div>{/each}
    </div>
  {/if} -->
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

  /* .query-state {
    margin: 10px 0;
    padding: 10px;
  }
 */
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

  .announce {
    margin: 10px 0;
  }
</style>
