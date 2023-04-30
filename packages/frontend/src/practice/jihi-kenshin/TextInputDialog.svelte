<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let onEnter: (t: string) => void;
  let text: string = "";

  function doEnter() {
    destroy();
    onEnter(text);
  }
</script>

<Dialog title="データ取り込み" {destroy}>
  <textarea bind:value={text}/>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .commands {
    display: flex;
    justify-content: right;
  }

  textarea {
    width: 400px;
    height: 600px;
  }

  .commands * + button {
    margin-left: 4px;
  }
</style>
