<script lang="ts">
  import type { UsageMaster } from "myclinic-model";
  import api from "../api";
  import Dialog from "../Dialog.svelte";
  import { setFocus } from "../set-focus";

  export let destroy: () => void;
  export let onEnter: (master: UsageMaster) => void;
  let searchText: string = "";
  let items: UsageMaster[] = [];

  async function doSearch() {
    let t = searchText.trim();
    if (t == "") {
      return;
    }
    items = await api.selectUsageMasterByUsageName(t);
  }

  function doItemClick(item: UsageMaster) {
    destroy();
    onEnter(item);
  }

</script>

<Dialog title="用法検索" {destroy}>
  <form class="search-form" on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} use:setFocus />
    <button on:click={doSearch}>検索</button>
  </form>
  <div class="search-results">
    {#each items as item (item.usage_code)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click={() => doItemClick(item)}>{item.usage_name}</div>
    {/each}
  </div>
</Dialog>

<style>
  .search-results {
    width: 240px;
    max-height: 360px;
    overflow-y: auto;
    margin: 10px 0;
  }

  .search-results > div {
    cursor: pointer;
  }

  .search-results > div:hover {
    background-color: #dddddd;
  }
</style>
