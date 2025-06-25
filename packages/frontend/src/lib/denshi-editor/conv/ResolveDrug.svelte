<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import SearchLink from "../icons/SearchLink.svelte";
  import "../widgets/style.css";
  import api from "@/lib/api";
  import { onMount } from "svelte";

  export let onDone: () => void;
  export let name: string;
  export let at: string;
  export let onResolved: (master: IyakuhinMaster) => void;
  let searchText = name;
  let searchResult: IyakuhinMaster[] = [];
  let inputElement: HTMLInputElement;

  async function doSearch() {
    searchResult = await api.searchIyakuhinMaster(searchText, at);
  }

  function doSelect(master: IyakuhinMaster) {
    onDone();
    onResolved(master);
  }

  onMount(() => {
    if (inputElement) {
      inputElement.focus();
      inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
    }
  });
</script>

<div class="wrapper">
  <div class="title">薬剤の解決</div>
  <div class="label">名称</div>
  <div class="small-text">{name}</div>
  <form on:submit|preventDefault={doSearch} class="with-icons">
    <input type="text" bind:value={searchText} class="search-input" bind:this={inputElement}/>
    <SearchLink onClick={doSearch} />
  </form>
  <div class="search-result">
    {#each searchResult as master (master.iyakuhincode)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="search-result-item" on:click={() => doSelect(master)}>
        {master.name}
      </div>
    {/each}
  </div>
  <div class="commands">
    <button on:click={onDone}>キャンセル</button>
  </div>
</div>

<style>
  form {
    margin: 10px 0;
  }

  .search-input {
    width: 20em;
  }

  .search-result {
    border: 1px solid gray;
    padding: 10px;
    overflow-y: auto;
    height: auto;
    max-height: 40vh;
  }

  .search-result-item {
    cursor: pointer;
  }

  .search-result-item:hover {
    background-color: #ccc;
  }
</style>
