<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import type { DrugKind } from "./drug-group-form-types";
  import api from "@/lib/api";
  import { onMount } from "svelte";

  export let drugKind: DrugKind | undefined;
  export let at: string;
  export let onDone: (value: DrugKind) => void;
  let searchText = "";
  let searchResult: IyakuhinMaster[] = [];
  let inputElement: HTMLInputElement;
  
  if( drugKind ){
    searchText = drugKind.薬品名称;
  }

  onMount(() => {
    inputElement?.focus();
  });

  async function doSearch() {
    const t = searchText.trim();
    if( t !== "" ){
      const ms = await api.searchIyakuhinMaster(t, at);
      searchResult = ms;
    }
  }

  function doMasterSelect(m: IyakuhinMaster) {
    onDone({
      薬品コード種別: "レセプト電算処理システム用コード",
      薬品コード: m.iyakuhincode.toString(),
      薬品名称: m.name,
      単位名: m.unit,
    })
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} bind:this={inputElement} class="search-text"/>
  </form>
  <div style="height:10em;overflow-y:auto;resize:vertical;font-size: 14px;margin-top:6px;border:1px solid gray;">
    {#each searchResult as master (master.iyakuhincode)}
      <div class="master-item" on:click={() => doMasterSelect(master)}>{master.name}</div>
    {/each}
  </div>
</div>

<style>
  .search-text {
    width: 22em;
  }

  .master-item {
    cursor: pointer;
  }

  .master-item:hover {
    background-color: #eee;
  }
</style>
