<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import api from "../api";
  import SelectItem from "../SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";

  export let at: string;
  let searchText = "";
  let searchResults: IyakuhinMaster[] = [];
  let searchSelected: Writable<IyakuhinMaster | null> = writable(null);
  let amount = "";
  let unit = "";
  let usage = "";
  let days = "";
  let daysUnit = "日分";

  async function doSearch() {
    const t = searchText.trim();
    if (t != "") {
      const result = await api.searchIyakuhinMaster(t, at);
      searchResults = result;
      let select = result[0];
      searchSelected.set(select ?? null);
      amount = "";
      unit = select?.unit ?? "";
    }
  }
</script>

<div>
  <div>
    <input type="text" bind:value={searchText} />
    <button on:click={doSearch}>検索</button>
  </div>
  {#if searchResults.length > 0}
  <div class="search-result">
    {#each searchResults as searchResult (searchResult.iyakuhincode)}
      <SelectItem data={searchResult} selected={searchSelected}>
        {searchResult.name}
      </SelectItem>
    {/each}
  </div>
  {/if}
  <div class="input-form">
    <span>用量：</span>
    <div class="inline-block">
      <input type="text" style="width:4em" bind:value={amount} />
      <input type="text" style="width:4em" bind:value={unit} />
    </div>
    <span>用量：</span>
    <div class="inline-block">
      <input type="text" bind:value={usage} />
    </div>
    <span>回数</span>
    <div class="inline-block">
      <input type="text" style="width:4em" bind:value={days} />
      {daysUnit}
    </div>
  </div>
  {#if $searchSelected}
    <div class="display">
      <span>{$searchSelected?.name ?? " "}</span>
      {#if amount !== ""}
        {amount}{unit}
      {/if}
      {usage}
      {#if days !== ""}
        {days}{daysUnit}
      {/if}
    </div>
  {/if}
</div>

<style>
  .inline-block {
    display: inline-block;
  }

  .search-result {
    margin: 10px 0;
    max-height: 180px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px;
    border: 1px solid gray;
  }

  .input-form {
    margin: 10px 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px;
  }

  .display {
    margin-top: 10px;
    border: 1px solid gray;
    padding: 10px;
  }
</style>
