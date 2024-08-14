<script lang="ts">
  import type { UsageMaster } from "myclinic-model";
  import api from "../api";
  import Dialog from "../Dialog.svelte";

  export let destroy: () => void;
  let searchText: string = "";
  let items: UsageMaster[] = [];
  
  async function doSearch() {
    let t = searchText.trim();
    if( t == "" ){
      return;
    }
    let result = await api.selectUsageMasterByUsageName(t);
    console.log(result);
  }
</script>

<Dialog title="用法検索" {destroy}>
  <div>
    <input type="text" bind:value={searchText}/> <button on:click={doSearch}>検索</button>
  </div>
  <div>
    {each items as item (item.usage_code)}
    {/each}
  </div>
</Dialog>