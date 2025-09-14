<script lang="ts">
  import type { KizaiMaster } from "myclinic-model";
  import Dialog from "../Dialog.svelte";
  import api from "../api";
  import { onMount } from "svelte";

  export let destroy: () => void;
  export let at: string;
  export let onEnter: (m: KizaiMaster) => void;
  let searchText = "";
  let results: KizaiMaster[] = [];
  let inputElement: HTMLInputElement;

  onMount(() => inputElement?.focus());

  async function doSearch() {
    searchText = searchText.trim();
    results = await api.searchKizaiMaster(searchText, at);
  }

  function doSelect(master: KizaiMaster) {
    destroy();
    onEnter(master);
  }
</script>

<Dialog title="医療器材検索" {destroy}>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} bind:this={inputElement} />
    <button type="submit">検索</button>
  </form>
  <div style="margin-top:10px;">
    {#each results as master (master.kizaicode)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div style="cursor:pointer" on:click={() => doSelect(master)}>{master.name}</div>
    {/each}
  </div>
</Dialog>