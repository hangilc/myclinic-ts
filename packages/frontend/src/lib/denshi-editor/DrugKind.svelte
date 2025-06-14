<script lang="ts">
  import type { 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";
  import api from "@/lib/api";
  import type { IyakuhinMaster } from "myclinic-model";
  import XCircle from "@/icons/XCircle.svelte";
  import { onMount } from "svelte";
  import MagnifyingGlass from "@/icons/MagnifyingGlass.svelte";
  import Trash from "@/icons/Trash.svelte";

  export let 薬品コード種別: 薬品コード種別;
  export let 薬品コード: string;
  export let 薬品名称: string;
  export let 単位名: string;
  export let at: string;
  export let onChange: (data: {
    薬品コード種別: 薬品コード種別;
    薬品コード: string;
    薬品名称: string;
    単位名: string;
  }) => void;

  let isEditing = false;
  let searchText = "";
  let searchResult: IyakuhinMaster[] = [];
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
    if (薬品コード) {
      if (薬品コード種別 === "一般名コード") {
        ippanmei = 薬品名称;
      } else if (薬品コード種別 === "レセプト電算処理システム用コード") {
        const iyakuhincode = parseInt(薬品コード);
        let m = await api.getIyakuhinMaster(iyakuhincode, at);
        if (
          薬品コード種別 === "レセプト電算処理システム用コード" &&
          m.iyakuhincode.toString() === 薬品コード
        ) {
          ippanmei = m.ippanmei ?? "";
        }
      }
    }
  }

  async function doSearch() {
    const t = searchText.trim();
    if (t !== "") {
      const ms = await api.searchIyakuhinMaster(t, at);
      searchResult = ms;
    }
  }

  function doCancel() {
    searchText = "";
    searchResult = [];
    if (薬品名称) {
      isEditing = false;
    } else {
      inputElement?.focus();
    }
  }

  function doMasterSelect(m: IyakuhinMaster) {
    薬品コード種別 = "レセプト電算処理システム用コード";
    薬品コード = m.iyakuhincode.toString();
    薬品名称 = m.name;
    単位名 = m.unit;
    ippanmei = m.ippanmei ?? "";
    ippanmeicode = m.ippanmeicode?.toString() ?? "";
    isEditing = false;
    searchText = "";
    searchResult = [];
    onChange({
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
        bind:value={searchText}
        bind:this={inputElement}
        class="search-text"
      />
      <a
        href="javascript:void(0)"
        style="position:relative;top:5px;margin-left:3px;"
        on:click={doSearch}><MagnifyingGlass /></a
      >
      {#if searchText.length > 0}
        <a
          href="javascript:void(0)"
          style="position:relative;top:5px;margin-left:-4px;"
          on:click={doClearSearchText}
        >
          <Trash color="#999" width="22" />
        </a>
      {/if}
      {#if 薬品名称}
        <a
          href="javascript:void(0)"
          style="position:relative;top:5px;margin-left:-4px;"
          on:click={doCancel}
        >
          <XCircle color="#999" width="22" />
        </a>
      {/if}
    </form>
    {#if searchResult.length > 0}
      <div class="search-result">
        {#each searchResult as master (master.iyakuhincode)}
          <div class="master-item" on:click={() => doMasterSelect(master)}>
            {master.name}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="rep" on:click={doEdit}>{薬品名称}</div>
  {#if 薬品コード種別 !== "一般名コード" && ippanmei}
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)" class="ippan-link" on:click={doIppanmei}
      >一般名有</a
    >
  {/if}
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
