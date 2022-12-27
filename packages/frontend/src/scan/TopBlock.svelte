<script lang="ts">

  export let onNewScan: () => void;
  export let onSavedImages: () => void;

  function doNewScan(): void {
    onNewScan();
  }

  function doSavedImages(): void {
    onSavedImages();
  }
</script>

<div class="top">
  <div class="title">スキャン</div>
  <button on:click={doNewScan}>新規スキャン</button>
  <button on:click={doSavedImages}>保存画像</button>
</div>

<style>
  .top {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .top button + button {
    margin-left: 4px;
  }

  .title {
    margin-right: 40px;
    font-size: 1.5rem;
  }



</style>
