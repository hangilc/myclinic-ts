<script lang="ts">
  import type { KizaiMaster } from "myclinic-model";
  import type { DrugKind } from "./drug-group-form-types";
  import { onMount } from "svelte";
  import XCircle from "@/icons/XCircle.svelte";
  import api from "@/lib/api";

  export let drugKind: DrugKind | undefined;
  export let at: string;
  export let onDone: (value: DrugKind) => void;
  export let onCancel: () => void;
  export let searchText = "";

  let searchResult: KizaiMaster[] = [];
  let inputElement: HTMLInputElement;

  if (drugKind) {
    searchText = drugKind.薬品名称;
  }

  onMount(() => {
    inputElement?.focus();
  });

  async function doSearch() {
    const t = searchText.trim();
    if( t !== "" ){
      const ms = await api.searchKizaiMaster(t, at);
      searchResult = ms;
    }
  }

  function doMasterSelect(m: KizaiMaster) {
    console.log("unit", m);
    onDone({
      薬品コード種別: "レセプト電算処理システム用コード",
      薬品コード: m.kizaicode.toString(),
      薬品名称: m.name,
      単位名: m.unit,
    })
  }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <form on:submit|preventDefault={doSearch}>
    <input
      type="text"
      bind:value={searchText}
      bind:this={inputElement}
      class="search-text"
    />
    <a
      href="javascript:void(0)"
      style="position:relative;top:5px;margin-left:3px;"
      on:click={onCancel}
    >
      <XCircle color="#999" width="22" />
    </a>
  </form>
  <div
    style="height:10em;overflow-y:auto;resize:vertical;font-size: 14px;margin-top:6px;border:1px solid gray;"
  >
    {#each searchResult as master (master.kizaicode)}
      <div class="master-item" on:click={() => doMasterSelect(master)}>
        {master.name}
      </div>
    {/each}
  </div>
</div>

<style>
  .search-text {
    width: 20em;
  }

  .master-item {
    cursor: pointer;
  }

  .master-item:hover {
    background-color: #eee;
  }
</style>
