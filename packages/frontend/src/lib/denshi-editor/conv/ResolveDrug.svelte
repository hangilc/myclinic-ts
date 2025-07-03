<script lang="ts">
  import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
  import SearchLink from "../icons/SearchLink.svelte";
  import "../widgets/style.css";
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import { onMount } from "svelte";
  import type { ConvAux4 } from "./denshi-conv";
  import type {
    情報区分,
    薬品コード種別,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import Link from "../widgets/Link.svelte";
  import type { 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
  import {
    index薬品補足レコード,
    unindex薬品補足レコード,
    type 薬品補足レコードIndexed,
  } from "../denshi-editor-types";
  import Hosoku from "../drug-form/Hosoku.svelte";

  export let onDone: () => void;
  export let at: string;
  export let onResolved: (
    resolved: ConvAux4,
    薬品補足レコード: 薬品補足レコード[],
  ) => void;
  export let 情報区分: 情報区分 | undefined = undefined;
  export let 薬品コード種別: 薬品コード種別 | undefined = undefined;
  export let 薬品コード: string | undefined = undefined;
  export let 薬品名称: string;
  export let 単位名: string | undefined = undefined;
  export let 薬品補足レコード: 薬品補足レコード[];
  let searchText = 薬品名称;
  let searchResult: IyakuhinMaster[] = [];
  let searchKizaiResult: KizaiMaster[] = [];
  let inputElement: HTMLInputElement;
  let cacheUpdateKey: string = 薬品名称;
  let cacheUpdateData:
    | undefined
    | number
    | {
        kind: "ippanmei";
        name: string;
        code: string;
      } 
    | {
      kind: "kizai";
      kizaicode: number;
    }= undefined;
  let ippanmei: string | undefined = undefined;
  let ippanmeicode: string | undefined = undefined;
  let suppls: 薬品補足レコードIndexed[] = 薬品補足レコード.map((r) =>
    index薬品補足レコード(r),
  );

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
      if (cacheUpdateData) {
        updateCache(cacheUpdateKey, cacheUpdateData);
      }
      onDone();
      onResolved(
        {
          情報区分,
          薬品コード種別,
          薬品コード,
          薬品名称,
          単位名,
        },
        suppls.map((r) => unindex薬品補足レコード(r)),
      );
    }
  }

  async function doSearch() {
    searchResult = await api.searchIyakuhinMaster(searchText, at);
  }

  async function doSearchKizai() {
    searchKizaiResult = await api.searchKizaiMaster(searchText, at);
  }

  async function updateCache(
    name: string,
    bind:
      | number
      | { kind: "ippanmei"; name: string; code: string }
      | { kind: "kizai"; kizaicode: number },
  ) {
    try {
      // Update the cache with the new drug name -> iyakuhin code mapping
      const currentMap = await cache.getDrugNameIyakuhincodeMap();
      const updatedMap = { ...currentMap };
      updatedMap[name] = bind;
      await cache.setDrugNameIyakuhincodeMap(updatedMap);
    } catch (error) {
      console.error("Failed to update drug cache:", error);
      // Continue with the selection even if cache update fails
    }
  }

  function doSelect(master: IyakuhinMaster) {
    情報区分 = "医薬品";
    薬品コード種別 = "レセプト電算処理システム用コード";
    薬品コード = master.iyakuhincode.toString();
    薬品名称 = master.name;
    単位名 = master.unit;
    ippanmei = master.ippanmei || undefined;
    ippanmeicode = master.ippanmeicode || undefined;
    cacheUpdateData = master.iyakuhincode;
    searchText = "";
    searchResult = [];
  }

  function doKizaiSelect(master: KizaiMaster) {
    情報区分 = "医療材料";
    薬品コード種別 = "レセプト電算処理システム用コード";
    薬品コード = master.kizaicode.toString();
    薬品名称 = master.name;
    単位名 = master.unit;
    ippanmei = undefined;
    ippanmeicode = undefined;
    cacheUpdateData = {
      kind: "kizai",
      kizaicode: master.kizaicode,
    }
    searchText = "";
    searchKizaiResult = [];
  }

  function doIppanmei() {
    if (ippanmei && ippanmeicode) {
      薬品コード種別 = "一般名コード";
      薬品コード = ippanmeicode;
      薬品名称 = ippanmei;
      cacheUpdateData = {
        kind: "ippanmei",
        name: ippanmei,
        code: ippanmeicode,
      };
    }
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

  function doAddHosoku() {
    suppls.push(index薬品補足レコード({ 薬品補足情報: "" }));
    suppls = suppls;
  }
</script>

<div class="wrapper">
  <div class="title">薬剤の解決</div>
  <div class="label">名称</div>
  <div class="small-text">{薬品名称}</div>
  <form on:submit|preventDefault={doSearch} class="with-icons">
    <input
      type="text"
      bind:value={searchText}
      class="search-input"
      bind:this={inputElement}
    />
    <SearchLink onClick={doSearch} />
    <a href="javascript:void(0)" on:click={doSearchKizai} class="kizai-link"
      >器材検索</a
    >
  </form>
  {#if searchResult.length > 0}
    <div class="search-result">
      {#each searchResult as master (master.iyakuhincode)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="search-result-item" on:click={() => doSelect(master)}>
          {master.name}
        </div>
      {/each}
    </div>
  {/if}
  {#if searchKizaiResult.length > 0}
    <div class="search-result">
      {#each searchKizaiResult as master (master.kizaicode)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="search-result-item" on:click={() => doKizaiSelect(master)}>
          {master.name}
        </div>
      {/each}
    </div>
  {/if}
  <div>
    <div class="label">薬品補足</div>
    <Hosoku bind:薬品補足レコード={suppls} />
  </div>
  <div class="commands">
    {#if ippanmei && ippanmeicode}
      <Link onClick={doIppanmei}>一般名に</Link>
    {/if}
    <Link onClick={doAddHosoku}>補足追加</Link>
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

  .kizai-link {
    font-size: 12px;
    margin-left: 12px;
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
