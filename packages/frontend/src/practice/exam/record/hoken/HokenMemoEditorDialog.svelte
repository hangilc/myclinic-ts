<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let memo: string | undefined;
  export let onEnter: (memo: string | undefined) => void;
  let memoValue: string = memo ?? "";

  function doEnter(): void {
    destroy();
    onEnter(memoValue || undefined);
  }

  function doClose(): void {
    destroy();
  }
</script>

<Dialog title="公費メモ編集" destroy={doClose}>
  <div class="main">
    <textarea bind:value={memoValue}/>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .commands {
    display: flex;
    justify-content: right;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
