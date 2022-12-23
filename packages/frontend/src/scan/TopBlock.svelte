<script lang="ts">

  export let onNewScan: () => void;

  function doNewScan(): void {
    onNewScan();
  }
</script>

<div class="top">
  <div class="title">スキャン</div>
  <button on:click={doNewScan}>新規スキャン</button>
</div>

<style>
  .top {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .title {
    margin-right: 40px;
    font-size: 1.5rem;
  }

</style>
