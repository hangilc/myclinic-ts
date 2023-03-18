<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { pad } from "@/lib/pad";
  import { convertHankakuKatakanaToZenkakuHiraKana } from "@/lib/zenkaku";
  import { OnshiResult } from "onshi-result";
  import * as kanjidate from "kanjidate";

  export let destroy: () => void;
  export let hokensha: string;
  export let hihokenshaBangou: string;
  export let hihokenshaKigou: string | undefined = undefined;
  export let edaban: string | undefined = undefined;
  export let birthdate: string;
  export let confirmDate: string;
  export let server: string;
  export let secret: string;
  export let onDone: (result: object | undefined) => void;
  let querying: boolean = true;
  let queryResult: OnshiResult | undefined = undefined;

  startQuery();

  async function startQuery() {
    const q = {
      hokensha: pad(hokensha, 8, "0"),
      hihokensha: hihokenshaBangou,
      kigou: hihokenshaKigou,
      edaban,
      birthdate,
      confirmationDate: confirmDate,
    };
    const r = await fetch(server + "/onshi/kakunin", {
      method: "POST",
      headers: {
        "X-ONSHI-VIEW-SECRET": secret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(q),
    });
    querying = false;
    const resultJson = await r.json();
    console.log(JSON.stringify(resultJson, undefined, 2));
    queryResult = OnshiResult.cast(resultJson);
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

<Dialog title="オンライン資格確認" destroy={doClose}>
  <div class="query">
    <span>保険者番号</span><span>{hokensha}</span>
    {#if hihokenshaKigou}
      <span>被保険者記号</span><span>{hihokenshaKigou}</span>
    {/if}
    <span>被保険者番号</span><span>{hihokenshaBangou}</span>
    <span>生年月日</span><span>{birthdate}</span>
    <span>確認日</span><span>{confirmDate}</span>
  </div>
  {#if querying}
    <div class="query-state">確認中...</div>
  {/if}
  {#if queryResult != undefined}
    {#if queryResult.isValid && queryResult.resultList.length > 0}
      <div>資格確認成功（{queryResult.resultList.length}）</div>
      <div>
        {#each queryResult.resultList as r}
          <div>
            <div>
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
          </div>
        {/each}
      </div>
    {:else}
      <div>資格確認失敗</div>
    {/if}
  {/if}
  <div class="commands">
    <button on:click={doClose}>閉じる</button>
  </div>
</Dialog>

<style>
  .query {
    display: grid;
    grid-template-columns: auto auto;
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
</style>
