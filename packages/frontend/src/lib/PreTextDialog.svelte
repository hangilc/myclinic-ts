<script lang="ts">
  import Dialog from "./Dialog.svelte";

  export let title: string = "Untitled";
  export let destroy: () => void;
  export let text: string;

  function doCopyAll() {
    navigator.clipboard.writeText(text);
    alert("クリップボードにコピーしました。");
  }
</script>

<Dialog {title} {destroy}>
  <pre>{text}</pre>
  <div>
    <button on:click={destroy}>閉じる</button>
    <button on:click={doCopyAll}>Copy All</button>
  </div>
</Dialog>

<style>
  pre {
    height: 26em;
    overflow: auto;
  }
</style>
