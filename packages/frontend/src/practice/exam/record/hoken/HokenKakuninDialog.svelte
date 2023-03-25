<script lang="ts">
  import type { OnshiKakuninQuery } from "@/lib/onshi-confirm";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";
  import type { OnshiResult } from "onshi-result";

  export let destroy: () => void;
  export let query: OnshiKakuninQuery;
  export let onRegister: (result: OnshiResult) => void;
  let result: OnshiResult | undefined = undefined;

  function doRegister(r: OnshiResult) {
    destroy();
    onRegister(r);
  }
</script>

<OnshiKakuninDialog {destroy} {query} bind:queryResult={result}>
  <div slot="commands" class="commands">
    {#if result && result.isValid}
      {#if result && result.isValid}
        <button on:click={() => doRegister(result)}>登録</button>
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
