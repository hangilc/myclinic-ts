<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { stringToOptionalDate } from "myclinic-model";

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
</style>
