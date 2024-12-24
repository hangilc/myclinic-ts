<script lang="ts">
  import Dialog from "../Dialog.svelte";

  export let destroy: () => void;
  export let code: string;
</script>

<Dialog title="電子処方箋コード" {destroy}>
  <pre>{code}</pre>
  <div style="margin-top:10px;padding:10px;text-align:right">
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>