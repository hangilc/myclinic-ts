<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { pad } from "@/lib/pad";
  import { convertHankakuKatakanaToZenkakuHiraKana } from "@/lib/zenkaku";
  import type { OnshiResult } from "onshi-result";
  import * as kanjidate from "kanjidate";
  import { onshiConfirm, type OnshiKakuninQuery } from "./onshi-confirm";
  import OnshiKakuninFormItem from "./OnshiKakuninFormItem.svelte";

  export let destroy: () => void;
  export let query: OnshiKakuninQuery;
  export let onDone: (result: OnshiResult | undefined) => void;
  let querying: boolean = true;
  let queryResult: OnshiResult | undefined = undefined;
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
    onDone(queryResult);
  }

  function formatDate(arg: Date | string): string {
    if (typeof arg === "string") {
      arg = new Date(arg);
    }
    return kanjidate.format(kanjidate.f2, arg);
  }
</script>

<Dialog title="オンライン資格確認" destroy={doClose} styleWidth="300px">
  <div class="query">
    <span>保険者番号</span><span>{query.hokensha}</span>
    {#if query.kigou}
      <span>被保険者記号</span><span>{query.kigou}</span>
    {/if}
    <span>被保険者番号</span><span>{query.hihokensha}</span>
    <span>生年月日</span><span>{query.birthdate}</span>
    <span>確認日</span><span>{query.confirmationDate}</span>
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
            <!-- <div>
              <span>氏名</span>
              <span>{r.name.replace("　", " ")}</span>
            </div>
            <div>
              <span>よみ</span>
              <span
                >{convertHankakuKatakanaToZenkakuHiraKana(
                  r.nameKana ?? ""
                )}</span
              >
            </div>
            {#if r.insurerNumber}
              <div>
                <span>保険者番号</span>
                <span>{r.insurerNumber}</span>
              </div>
            {/if}
            {#if r.insuredCardSymbol}
              <div>
                <span>被保険者記号</span>
                <span>{r.insuredCardSymbol}</span>
              </div>
            {/if}
            {#if r.insuredIdentificationNumber}
              <div>
                <span>被保険者番号</span>
                <span>{r.insuredIdentificationNumber}</span>
              </div>
            {/if}
            {#if r.insuredBranchNumber}
              <div>
                <span>枝番</span>
                <span>{r.insuredBranchNumber}</span>
              </div>
            {/if}
            {#if r.personalFamilyClassification}
              <div>
                <span>本人・家族</span>
                <span>{r.personalFamilyClassification}</span>
              </div>
            {/if}
            {#if r.koukikoureiFutanWari}
              <div>
                <span>後期高齢</span>
                <span>{r.koukikoureiFutanWari}割</span>
              </div>
            {/if}
            {#if r.insuredCardValidDate}
              <div>
                <span>期限開始</span>
                <span>{formatDate(r.insuredCardValidDate)}</span>
              </div>
              <div>
                <span>期限終了</span>
                <span
                  >{r.insuredCardExpirationDate
                    ? formatDate(r.insuredCardExpirationDate)
                    : "（なし）"}</span
                >
              </div>
            {/if}
            {#if r.elderlyRecipientCertificateInfo != undefined}
              {@const kourei = r.elderlyRecipientCertificateInfo}
              {#if kourei.futanWari}
                <div>
                  <span>高齢</span>
                  <span>{kourei.futanWari}割</span>
                </div>
              {/if}
            {/if}
            {#if r.limitApplicationCertificateRelatedInfo}
              {@const data = r.limitApplicationCertificateRelatedInfo}
              <div>
                <span>限度額適用</span>
                <span>{data.kind ?? ""}</span>
              </div>
            {/if} -->
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
  <div class="commands">
    <button on:click={doClose}>閉じる</button>
  </div>
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
