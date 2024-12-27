<script lang="ts">
  import type { UsageMaster } from "myclinic-model";
  import api from "../api";
  import Dialog from "../Dialog.svelte";
  import { onMount } from "svelte";
  import { dialogSelector } from "@cypress/lib/dialog";

  export let destroy: () => void;
  export let onEnter: (master: UsageMaster) => void;
  let searchText = "";
  let searchResult: UsageMaster[] = [];
  let searchTextElement: HTMLInputElement;

  onMount(() => {
    searchTextElement?.focus();
  });

  async function doSearch() {
    const t = searchText.trim();
    if (t) {
      searchResult = await api.selectUsageMasterByUsageName(t);
    }
  }

  function doSelect(m: UsageMaster) {
    destroy();
    onEnter(m);
  }
</script>

<Dialog title="用法マスター検索" {destroy}>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} bind:this={searchTextElement} />
    <button type="submit">検索</button>
  </form>
  <div>
    {#each searchResult as master}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div style="cursor:pointer;" on:click={() => doSelect(master)}>
        {master.usage_name}
      </div>
    {/each}
  </div>
  <div style="margin:10px 0;text-align:right;">
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>
