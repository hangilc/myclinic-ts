<script lang="ts">
  import api from "../api";
  import { getShohouFreqUsage, type FreqUsage } from "../cache";
  import Dialog from "../Dialog.svelte";

  export let destroy: () => void;
  let usages: FreqUsage[] = [];
  let searchText = "";

  init();

  async function init() {
    usages = await getShohouFreqUsage();
  }

  async function doSearch() {
    let t = searchText.trim();
    if( t ){
      let result = await api.selectUsageMasterByUsageName(t);
      console.log(result);
    }
  }

  function doClose() {
    destroy();
  }
</script>

<Dialog title="登録用法管理" {destroy} styleWidth="400px">
  <div class="enter">
    <div>
      <input type="text" bind:value={searchText} />
      <button on:click={doSearch}>検索</button>
    </div>
  </div>
  <div class="list">
    {#each usages as item, i (item.index)}
      <div>
        {i}.
      </div>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doClose}>閉じる</button>
  </div>
</Dialog>

<style>
  .commands {
    text-align: right;
  }
</style>

