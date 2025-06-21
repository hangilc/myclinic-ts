<script lang="ts">
  import type {
    薬品コード種別,
    情報区分,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import api from "@/lib/api";
  import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
  import { onMount, tick } from "svelte";
  import "../widgets/style.css";
  import SearchLink from "../icons/SearchLink.svelte";
  import EraserLink from "../icons/EraserLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";

  export let 薬品コード: string;
  export let 薬品名称: string;
  export let 情報区分: 情報区分;
  export let 薬品コード種別: 薬品コード種別;
  export let 単位名: string | undefined;
  export let ippanmei: string;
  export let ippanmeicode: string;
  export let at: string;
  export let notifyCancel: () => void;
  export let notifySelect: () => void;

  let searchText: string = 薬品名称;
  let inputElement: HTMLInputElement;
  let searchIyakuhinResult: IyakuhinMaster[] = [];
  let searchKizaiResult: KizaiMaster[] = [];

  export const focus: () => boolean = () => {
    if (inputElement) {
      inputElement.focus();
      return true;
    } else {
      return false;
    }
  };

  onMount(() => focus());

  // $: if (薬品コード === "") {
  //   tick().then(() => focus());
  // }

  async function doSearch() {
    const t = searchText.trim();
    if (t === "") {
      return;
    }
    if (情報区分 === "医薬品") {
      const ms = await api.searchIyakuhinMaster(t, at);
      searchIyakuhinResult = ms;
    } else {
      const ms = await api.searchKizaiMaster(t, at);
      searchKizaiResult = ms;
    }
  }

  function doClearSearchText() {
    searchText = "";
    searchIyakuhinResult = [];
    searchKizaiResult = [];
    inputElement?.focus();
  }

  function doCancel() {
    searchText = "";
    searchIyakuhinResult = [];
    if (薬品名称) {
      notifyCancel();
    } else {
      inputElement?.focus();
    }
  }

  function doIyakuhinMasterSelect(m: IyakuhinMaster) {
    薬品コード種別 = "レセプト電算処理システム用コード";
    薬品コード = m.iyakuhincode.toString();
    薬品名称 = m.name;
    単位名 = m.unit;
    ippanmei = m.ippanmei ?? "";
    ippanmeicode = m.ippanmeicode?.toString() ?? "";
    searchText = "";
    searchIyakuhinResult = [];
    notifySelect();
  }

  function doKizaiMasterSelect(m: KizaiMaster) {
    薬品コード種別 = "レセプト電算処理システム用コード";
    薬品コード = m.kizaicode.toString();
    薬品名称 = m.name;
    単位名 = m.unit;
    ippanmei = "";
    ippanmeicode = "";
    searchText = "";
    searchKizaiResult = [];
    notifySelect();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-invalid-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div>
  <form on:submit|preventDefault={doSearch}>
    <div class="label">薬品名検索</div>
    <div class="input-with-icons">
      <input
        type="text"
        tabindex="0"
        bind:value={searchText}
        bind:this={inputElement}
        class="search-text"
      />
      <SearchLink onClick={doSearch} />
      <EraserLink onClick={doClearSearchText} />
      {#if 薬品名称}
        <CancelLink onClick={doCancel} />
      {/if}
    </div>
  </form>
  {#if searchIyakuhinResult.length > 0}
    <div class="search-result">
      {#each searchIyakuhinResult as master (master.iyakuhincode)}
        <div
          class="master-item"
          on:click={() => doIyakuhinMasterSelect(master)}
        >
          {master.name}
        </div>
      {/each}
    </div>
  {/if}
  {#if searchKizaiResult.length > 0}
    <div class="search-result">
      {#each searchKizaiResult as master (master.kizaicode)}
        <div class="master-item" on:click={() => doKizaiMasterSelect(master)}>
          {master.name}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-text {
    width: 18em;
  }

  .search-result {
    height: 10em;
    overflow-y: auto;
    resize: vertical;
    font-size: 14px;
    margin-top: 6px;
    border: 1px solid gray;
  }

  .master-item {
    cursor: pointer;
  }

  .master-item:hover {
    background-color: #eee;
  }

  .input-with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }
</style>
