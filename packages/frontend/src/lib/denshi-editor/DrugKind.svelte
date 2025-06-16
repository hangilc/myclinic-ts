<script lang="ts">
  import type {
    薬品コード種別,
    情報区分,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import api from "@/lib/api";
  import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
  import XCircle from "@/icons/XCircle.svelte";
  import { onMount } from "svelte";
  import MagnifyingGlass from "@/icons/MagnifyingGlass.svelte";
  import Eraser from "@/icons/Eraser.svelte";
  import type { 不均等レコード } from "@/lib/denshi-shohou/presc-info";
  import Rep from "./drug-kind/Rep.svelte";

  export let 情報区分: 情報区分;
  export let 薬品コード種別: 薬品コード種別;
  export let 薬品コード: string;
  export let 薬品名称: string;
  export let 単位名: string | undefined;
  export let 不均等レコード: 不均等レコード | undefined;
  export let at: string;
  export let onChange: (data: {
    情報区分: 情報区分;
    薬品コード種別: 薬品コード種別;
    薬品コード: string;
    薬品名称: string;
    単位名: string | undefined;
  }) => void;

  let isEditing = false;
  let searchText = "";
  let searchIyakuhinResult: IyakuhinMaster[] = [];
  let searchKizaiResult: KizaiMaster[] = [];
  let inputElement: HTMLInputElement;
  let ippanmei = "";
  let ippanmeicode = "";

  if (薬品コード === "") {
    isEditing = true;
  }

  initIppanmei();

  onMount(() => {
    if (isEditing && inputElement) {
      inputElement.focus();
    }
  });

  async function initIppanmei() {
    if (情報区分 === "医薬品" && 薬品コード) {
      if (薬品コード種別 === "一般名コード") {
        ippanmei = 薬品名称;
        ippanmeicode = 薬品コード;
      } else if (薬品コード種別 === "レセプト電算処理システム用コード") {
        const iyakuhincode = parseInt(薬品コード);
        let m = await api.getIyakuhinMaster(iyakuhincode, at);
        if (
          薬品コード種別 === "レセプト電算処理システム用コード" &&
          m.iyakuhincode.toString() === 薬品コード
        ) {
          ippanmei = m.ippanmei ?? "";
          ippanmeicode = m.ippanmeicode ?? "";
        }
      }
    } else {
      ippanmei = "";
      ippanmeicode = "";
    }
  }

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

  function doCancel() {
    searchText = "";
    searchIyakuhinResult = [];
    if (薬品名称) {
      isEditing = false;
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
    isEditing = false;
    searchText = "";
    searchIyakuhinResult = [];
    onChange({
      情報区分,
      薬品コード種別,
      薬品コード,
      薬品名称,
      単位名,
    });
  }

  function doKizaiMasterSelect(m: KizaiMaster) {
    薬品コード種別 = "レセプト電算処理システム用コード";
    薬品コード = m.kizaicode.toString();
    薬品名称 = m.name;
    単位名 = m.unit;
    ippanmei = "";
    ippanmeicode = "";
    isEditing = false;
    searchText = "";
    searchKizaiResult = [];
    onChange({
      情報区分,
      薬品コード種別,
      薬品コード,
      薬品名称,
      単位名,
    });
  }

  function doIppanmei() {
    if (ippanmei && ippanmeicode) {
      薬品コード種別 = "一般名コード";
      薬品コード = ippanmeicode;
      薬品名称 = ippanmei;
    }
  }

  function doEdit() {
    searchText = 薬品名称;
    isEditing = true;
  }

  function doClearSearchText() {
    searchText = "";
    inputElement?.focus();
  }
</script>

{#if isEditing}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-invalid-attribute -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div>
    <form on:submit|preventDefault={doSearch}>
      <input
        type="text"
        tabindex="0"
        bind:value={searchText}
        bind:this={inputElement}
        class="search-text"
      />
      <a
        href="javascript:void(0)"
        style="position:relative;top:5px;margin-left:3px;"
        tabindex="-1"
        on:click={doSearch}><MagnifyingGlass /></a
      >
      {#if searchText.length > 0}
        <a
          href="javascript:void(0)"
          style="position:relative;top:5px;margin-left:-4px;"
          tabindex="-1"
          on:click={doClearSearchText}
        >
          <Eraser color="#999" />
        </a>
      {/if}
      {#if 薬品名称}
        <a
          href="javascript:void(0)"
          style="position:relative;top:5px;margin-left:-4px;"
          tabindex="-1"
          on:click={doCancel}
        >
          <XCircle color="#999" />
        </a>
      {/if}
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
{:else}
  <Rep
    {薬品コード種別}
    {薬品名称}
    {ippanmei}
    onClick={doEdit}
    onIppanmeiClick={doIppanmei}
  />
{/if}

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

  .rep {
    cursor: pointer;
  }

  .ippan-link {
    white-space: nowrap;
    font-size: 0.8em;
    border: 1px solid blue;
    padding: 1px 6px;
    border-radius: 6px;
    background: rgba(0, 0, 255, 0.05);
  }
</style>
