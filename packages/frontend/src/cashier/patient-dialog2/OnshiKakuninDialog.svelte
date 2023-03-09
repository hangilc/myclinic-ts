<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { pad } from "@/lib/pad";
  import * as onshiLib from "onshi-lib";
  // const { onshiIsValid } = require("onshi-lib");

  export let destroy: () => void;
  export let hokensha: string;
  export let hihokenshaBangou: string;
  export let hihokenshaKigou: string | undefined = undefined;
  export let birthdate: string;
  export let confirmDate: string;
  export let server: string;
  export let secret: string;
  export let onDone: (result: object | undefined) => void;
  let querying: boolean = true;
  let queryResult: object | undefined = undefined;

  startQuery();
  console.log("onshiLib", onshiLib);

  async function startQuery() {
    const q = {
      hokensha: pad(hokensha, 8, "0"),
      hihokensha: hihokenshaBangou,
      kigou: hihokenshaKigou,
      birthdate,
      confirmationDate: confirmDate,
    }
    const r = await fetch(server + "/onshi/kakunin", {
      method: "POST",
      headers: {
        "X-ONSHI-VIEW-SECRET": secret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(q),
    });
    querying = false;
    queryResult = await r.json();
    console.log(JSON.stringify(queryResult, undefined, 2));
  }

  function doClose(): void {
    destroy();
    onDone(queryResult)
  }

</script>

<Dialog title="オンライン資格確認" destroy={doClose}>
  <div class="query">
    <span>保険者番号</span><span>{hokensha}</span>
    {#if hihokenshaKigou }
    <span>被保険者記号</span><span>{hihokenshaKigou}</span>
    {/if}
    <span>被保険者番号</span><span>{hihokenshaBangou}</span>
    <span>生年月日</span><span>{birthdate}</span>
    <span>確認日</span><span>{confirmDate}</span>
  </div>
  {#if querying}
  <div class="query-state">確認中...</div>
  {/if}
  {#if queryResult}
    {#if onshiLib.onshiIsValid(queryResult) }
      <div>オンラインで資格確認ができました。</div>
    {:else}
      <div>資格確認失敗。</div>
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
