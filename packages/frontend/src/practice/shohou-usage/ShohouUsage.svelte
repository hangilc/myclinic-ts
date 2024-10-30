<script lang="ts">
  import api from "@/lib/api";
  import { invalidateShohouFreqUsage, type FreqUsage } from "@/lib/cache";
  import ServiceHeader from "@/ServiceHeader.svelte";
  import type { UsageMaster } from "myclinic-model";
  let freqUsages: FreqUsage[] = [];
  let searchText = "";
  let searchResult: UsageMaster[] = [];
  let freeText = "";
  let freeKubun: "内服" | "頓服" | "外用" = "内服";
  let mode: "master" | "free" = "master";

  init();

  async function init() {
    freqUsages = await api.getShohouFreqUsage();
    console.log("freqUsage", freqUsages);
  }

  async function doSearch() {
    searchText = searchText.trim();
    if (searchText === "") {
      searchResult = [];
      return;
    }
    searchResult = await api.selectUsageMasterByUsageName(searchText);
    console.log("searchResult", searchResult);
  }

  async function doSearchSelect(master: UsageMaster) {
    let kubun: "内服" | "頓服" | "外用" = "外用";
    if (master.kubun_name === "内服") {
      if (master.timing_name === "頓用指示型") {
        kubun = "頓服";
      } else {
        kubun = "内服";
      }
    }
    let freq: FreqUsage = {
      剤型区分: kubun,
      用法コード: master.usage_code,
      用法名称: master.usage_name,
    };
    let current = await api.getShohouFreqUsage();
    current.push(freq);
    await api.saveShohouFreqUsage(current);
    invalidateShohouFreqUsage();
    init();
  }

  async function doDelete(usage: FreqUsage) {
    if (!confirm(`「${usage.用法名称}」を削除していいですか？`)) {
      return;
    }
    let usages = freqUsages.filter(
      (item) => item.用法コード !== usage.用法コード
    );
    await api.saveShohouFreqUsage(usages);
    invalidateShohouFreqUsage();
    init();
  }

  async function doFreeForm() {
    freeText = freeText.trim();
    if( freeText === "" ){
      return;
    }
    let freq: FreqUsage = {
      剤型区分: freeKubun,
      用法コード: "0X0XXXXXXXXX0000",
      用法名称: freeText,
    }
    let current = await api.getShohouFreqUsage();
    current.push(freq);
    await api.saveShohouFreqUsage(current);
    init();
    freeText = "";
  }
</script>

<ServiceHeader title="処方用法管理" />
<div>
  <input type="radio" value="master" bind:group={mode} /> マスター
  <input type="radio" value="free" bind:group={mode} /> 自由文章
</div>
{#if mode === "master"}
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} />
    <button type="submit">検索</button>
  </form>
{:else}
  <input type="radio" value="内服" bind:group={freeKubun} />内服
  <input type="radio" value="頓服" bind:group={freeKubun} />頓服
  <input type="radio" value="外用" bind:group={freeKubun} />外用
  <form on:submit|preventDefault={doFreeForm}>
    <input type="text" bind:value={freeText} />
    <button type="submit">入力</button>
  </form>
{/if}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  {#each searchResult as master (master.usage_code)}
    <div
      style="cursor:pointer;user-select:none;"
      class="search-result"
      on:click={() => doSearchSelect(master)}
    >
      {master.usage_name}
    </div>
  {/each}
</div>
<div style="margin:10px 0;border:1px solid gray;padding:10px;">
  {#each freqUsages as usage (usage.用法コード)}
    <div>
      {usage.用法名称}
      <a href="javascript:void(0)" on:click={() => doDelete(usage)}>削除</a>
    </div>
  {/each}
</div>

<style>
  .search-result:hover {
    font-weight: bold;
    background-color: #eee;
  }
</style>
