<script lang="ts">
  import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
  import CancelLink from "../../icons/CancelLink.svelte";
  import SearchLink from "../../icons/SearchLink.svelte";
  import Field from "./Field.svelte";
  import FieldForm from "./FieldForm.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import type {
    情報区分,
    薬品コード種別,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import api from "@/lib/api";

  export let 情報区分: 情報区分 = "医薬品";
  export let 薬品コード種別: 薬品コード種別;
  export let 薬品名称: string;
  export let 薬品コード: string;
  export let isEditing: boolean;
  export let 単位名: string = "";
  export let at: string;

  let inputElement: HTMLInputElement;
  let searchText = 薬品名称;
  let iyakuhinSearchResult: IyakuhinMaster[] = [];
  let kizaiSearchResult: KizaiMaster[] = [];
  let ippanmei: string | undefined = undefined;
  let ippanmeicode: string | undefined = undefined;

  function doRepClick() {}

  function doCancelSearch() {}

  function doIyakuhinSelect(master: IyakuhinMaster) {
    薬品コード種別 = "レセプト電算処理システム用コード";
    薬品コード = master.iyakuhincode.toString();
    薬品名称 = master.name;
    単位名 = master.unit;
    ippanmei = master.ippanmei || undefined;
    ippanmeicode = master.ippanmeicode || undefined;
    searchText = "";
    iyakuhinSearchResult = [];
    isEditing = false;
  }

  function doKizaiSelect(master: KizaiMaster) {
    薬品コード種別 = "レセプト電算処理システム用コード";
    薬品コード = master.kizaicode.toString();
    薬品名称 = master.name;
    単位名 = master.unit;
    ippanmei = undefined;
    ippanmeicode = undefined;
    searchText = "";
    kizaiSearchResult = [];
    isEditing = false;
  }

  async function doSearch() {
    if (情報区分 === "医薬品") {
      iyakuhinSearchResult = await api.searchIyakuhinMaster(searchText, at);
    } else {
      kizaiSearchResult = await api.searchKizaiMaster(searchText, at);
    }
  }
</script>

<Field>
  <FieldTitle>{情報区分 === "医薬品" ? "薬品名称" : "器材名称"}</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="rep" on:click={doRepClick}>{薬品名称}</div>
    {:else}
      <form class="with-icons" on:submit|preventDefault={doSearch}>
        <input
          type="text"
          bind:value={searchText}
          class="search-input"
          bind:this={inputElement}
        />
        <SearchLink onClick={doSearch} />
        {#if 薬品コード}
          <CancelLink onClick={doCancelSearch} />
        {/if}
      </form>
      {#if iyakuhinSearchResult.length > 0}
        <div class="search-result">
          {#each iyakuhinSearchResult as master (master.iyakuhincode)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="search-result-item"
              on:click={() => doIyakuhinSelect(master)}
            >
              {master.name}
            </div>
          {/each}
        </div>
      {/if}
      {#if kizaiSearchResult.length > 0}
        <div class="search-result">
          {#each kizaiSearchResult as master (master.kizaicode)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="search-result-item"
              on:click={() => doKizaiSelect(master)}
            >
              {master.name}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </FieldForm>
</Field>

<style>
  .rep {
    cursor: pointer;
  }

  .search-input {
    width: 20em;
  }

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .search-result {
    border: 1px solid gray;
    padding: 10px;
    margin: 10px 0;
  }

  .search-result-item {
    cursor: pointer;
  }

  .search-result-item:hover {
    background-color: #ccc;
  }
</style>
