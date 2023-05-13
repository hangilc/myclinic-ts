<script lang="ts">
  import OnshiKakuninFormItem from "@/lib/OnshiKakuninFormItem.svelte";
  import Dialog from "@/lib/Dialog.svelte";
  import type { OnshiResult } from "onshi-result";

  export let destroy: () => void;
  export let result: OnshiResult;
</script>

<Dialog {destroy} title="資格確認結果">
  <OnshiKakuninFormItem result={result.resultList[0]} />
  <div class="commands">
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>

<style>
  .commands {
    display: flex;
    justify-content: right;
  }
</style>
