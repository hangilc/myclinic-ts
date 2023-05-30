<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let memo: string | undefined;
  export let onEnter: (newMemo: string | undefined) => void;
  let memoValue = memo || "";

  function doEnter(): void {
    destroy();
    onEnter(memoValue || undefined);
  }

  function doClose(): void {
    destroy();
  }
</script>

<Dialog title="患者メモ編集" destroy={doClose}>
  <div class="info">
    <div>"onshi-name": "オンライン資格氏名"</div>
    <div>"rezept-name": "レセプト氏名"</div>
  </div>
  <div class="main">
    <textarea bind:value={memoValue} />
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .main textarea {
    width: 300px;
    height: 300px;
    font-size: 14px;
  }

  .commands {
    display: flex;
    justify-content: right;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
