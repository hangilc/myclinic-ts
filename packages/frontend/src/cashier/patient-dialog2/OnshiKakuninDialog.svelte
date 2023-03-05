<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { pad } from "@/lib/pad";

  export let destroy: () => void;
  export let hokensha: string;
  export let hihokenshaBangou: string;
  export let hihokenshaKigou: string | undefined = undefined;
  export let birthdate: string;
  export let confirmDate: string;
  export let server: string;
  export let secret: string;
  export let onConfirm: (kakunin: string) => void;
  let querying: boolean = true;
  let queryResult: any = undefined;

  startQuery();

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
      mode: "no-cors",
      headers: {
        "X-ONSHI-VIEW-SECRET": secret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(q),
    });
    querying = false;
    queryResult = r.json();
  }

  function formatQueryResult(r: string): string {
    return r.replaceAll("\n", "<br/>\n");
  }

</script>

<Dialog title="オンライン資格確認" {destroy}>
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
  <div class="query-result">{formatQueryResult(queryResult)}</div>
  {/if}
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

  .query-result {
    margin: 10px 0;
    padding: 10px;
    max-height: 100px;
    max-width: 200px;
    overflow: auto;
  }
</style>
