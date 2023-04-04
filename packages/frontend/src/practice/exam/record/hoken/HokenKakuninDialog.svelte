<script lang="ts">
  import api from "@/lib/api";
  import type { OnshiKakuninQuery } from "@/lib/onshi-confirm";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";
  import { Onshi } from "myclinic-model";
  import type { OnshiResult } from "onshi-result";

  export let destroy: () => void;
  export let query: OnshiKakuninQuery;
  export let visitId: number;
  export let onRegister: (result: OnshiResult) => void;
  let result: OnshiResult | undefined = undefined;

  async function doRegister(r: OnshiResult) {
    await api.setOnshi(new Onshi(visitId, JSON.stringify(r.toJSON())));
    destroy();
    onRegister(r);
  }
</script>

<OnshiKakuninDialog {destroy} {query} bind:queryResult={result}>
  <div slot="commands" class="commands">
    {#if result}
      {@const r = result}
      {#if r.isValid}
        <button on:click={() => doRegister(r)}>登録</button>
      {/if}
    {/if}
    <button on:click={destroy}>閉じる</button>
  </div>
</OnshiKakuninDialog>

<style>
  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
