<script lang="ts">
  import api from "@/lib/api";
  import type { FreqUsage } from "@/lib/cache";
  import ServiceHeader from "@/ServiceHeader.svelte";
  import type { UsageMaster } from "myclinic-model";
  let freqUsages: FreqUsage[] = [];
  let searchText = "";
  let searchResult: UsageMaster[] = [];

  init();

  async function init() {
    freqUsages = await api.getShohouFreqUsage();
  }

  async function doSearch() {
    searchText = searchText.trim();
    if( searchText === "" ){
      return;
    }
    searchResult = await api.selectUsageMasterByUsageName(searchText);
    console.log(searchResult);
  }
</script>

<ServiceHeader title="処方用法管理" />
<form on:submit|preventDefault={doSearch}>
  <input type="text" bind:value={searchText} /> <button type="submit">検索</button>
</form>
<div>
  {#each searchResult as master (master.usage_code)}
    <div>
      {master.usage_name}
    </div>
  {/each}
</div>
<div>
  {#each freqUsages as usage (usage.用法コード)}
    <div>{usage.用法名称}</div>
  {/each}
</div>