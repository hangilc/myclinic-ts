<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import SearchLink from "../icons/SearchLink.svelte";
  import "../widgets/style.css";
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import { onMount } from "svelte";
  import { createPartial2FromIyakuhinMaster } from "./denshi-conv-helper";
  import type { ConvAux4 } from "./denshi-conv";
  import type {
    剤形区分,
    力価フラグ,
    情報区分,
    薬品コード種別,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import type {
    PrescInfoData,
    RP剤情報,
    不均等レコード,
    備考レコード,
    剤形レコード,
    提供情報レコード,
    提供診療情報レコード,
    検査値データ等レコード,
    用法レコード,
    用法補足レコード,
    薬品レコード,
    薬品情報,
    薬品補足レコード,
  } from "@/lib/denshi-shohou/presc-info";

  export let onDone: () => void;
  export let at: string;
  export let onResolved: (resolved: ConvAux4) => void;
  export let 情報区分: 情報区分 | undefined = undefined;
  export let 薬品コード種別: 薬品コード種別 | undefined = undefined;
  export let 薬品コード: string | undefined = undefined;
  export let 薬品名称: string;
  export let 単位名: string | undefined = undefined;
  let searchText = name;
  let searchResult: IyakuhinMaster[] = [];
  let inputElement: HTMLInputElement;
  let isUpdatedByMaster = false;

  function isAllSet(
    情報区分: 情報区分 | undefined,
    薬品コード種別: 薬品コード種別 | undefined,
    薬品コード: string | undefined,
    単位名: string | undefined,
  ): boolean {
    return (
      情報区分 !== undefined &&
      薬品コード種別 !== undefined &&
      薬品コード !== undefined &&
      単位名 !== undefined
    );
  }

  function doEnter() {
    if (
      情報区分 !== undefined &&
      薬品コード種別 !== undefined &&
      薬品コード !== undefined &&
      単位名 !== undefined
    ) {
      onResolved({
        情報区分,
        薬品コード種別,
        薬品コード,
        薬品名称,
        単位名,
      });
    }
  }

  async function doSearch() {
    searchResult = await api.searchIyakuhinMaster(searchText, at);
  }

  async function updateMap() {
    if (
      薬品コード !== undefined &&
      薬品コード種別 === "レセプト電算処理システム用コード"
    ) {
      try {
        // Update the cache with the new drug name -> iyakuhin code mapping
        const currentMap = await cache.getDrugNameIyakuhincodeMap();
        const updatedMap = { ...currentMap };
        updatedMap[name] = master.iyakuhincode;
        await cache.setDrugNameIyakuhincodeMap(updatedMap);
      } catch (error) {
        console.error("Failed to update drug cache:", error);
        // Continue with the selection even if cache update fails
      }
    }
  }

  async function doSelect(master: IyakuhinMaster) {
    try {
      // Update the cache with the new drug name -> iyakuhin code mapping
      const currentMap = await cache.getDrugNameIyakuhincodeMap();
      const updatedMap = { ...currentMap };
      updatedMap[name] = master.iyakuhincode;
      await cache.setDrugNameIyakuhincodeMap(updatedMap);
    } catch (error) {
      console.error("Failed to update drug cache:", error);
      // Continue with the selection even if cache update fails
    }

    onDone();
    onResolved(createPartial2FromIyakuhinMaster(master, false));
  }

  onMount(() => {
    if (inputElement) {
      inputElement.focus();
      inputElement.setSelectionRange(
        inputElement.value.length,
        inputElement.value.length,
      );
    }
  });
</script>

<div class="wrapper">
  <div class="title">薬剤の解決</div>
  <div class="label">名称</div>
  <div class="small-text">{name}</div>
  <form on:submit|preventDefault={doSearch} class="with-icons">
    <input
      type="text"
      bind:value={searchText}
      class="search-input"
      bind:this={inputElement}
    />
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
    {#if isAllSet(情報区分, 薬品コード種別, 薬品コード, 単位名)}
      <button on:click={doEnter}>入力</button>
    {/if}
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
    max-height: 340px;
  }

  .search-result-item {
    cursor: pointer;
  }

  .search-result-item:hover {
    background-color: #ccc;
  }
</style>
