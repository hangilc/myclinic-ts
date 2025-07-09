<script lang="ts">
  import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
  import type { 薬品情報Wrapper } from "../denshi-tmpl";
  import CancelLink from "../icons/CancelLink.svelte";
  import EraserLink from "../icons/EraserLink.svelte";
  import SearchLink from "../icons/SearchLink.svelte";
  import Field from "./workarea/Field.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import api from "@/lib/api";
  import { tick } from "svelte";

  export let drug: 薬品情報Wrapper;
  export let isEditing: boolean;
  export let at: string;
  export let onFieldChange: () => void;
  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  }
  let searchText = drug.data.薬品レコード.薬品名称;
  let inputElement: HTMLInputElement;
  let searchIyakuhinResult: IyakuhinMaster[] = [];
  let searchKizaiResult: KizaiMaster[] = [];

  function doRepClick() {
    searchText = drug.data.薬品レコード.薬品名称;
    isEditing = true;
    focus();
  }

  async function doSearch() {
    let t = searchText.trim();
    if (t !== "") {
      if (drug.data.薬品レコード.情報区分 === "医薬品") {
        searchIyakuhinResult = await api.searchIyakuhinMaster(t, at);
      } else if (drug.data.薬品レコード.情報区分 === "医療材料") {
        searchKizaiResult = await api.searchKizaiMaster(t, at);
      }
    } else {
      searchIyakuhinResult = [];
      searchKizaiResult = [];
    }
  }

  function doClearSearchText() {
    searchText = "";
  }

  function doCancel() {
    if( drug.data.薬品レコード.薬品コード !== "" ){
      isEditing = false;
    }
  }

  function doIyakuhinMasterSelect(m: IyakuhinMaster) {
    Object.assign(drug.data.薬品レコード, {
      薬品コード種別: "レセプト電算処理システム用コード",
      薬品コード: m.iyakuhincode.toString(),
      薬品名称: m.name,
      単位名: m.unit,
    });
    drug.ippanmei = m.ippanmei;
    drug.ippanmeicode = m.ippanmeicode?.toString();
    searchText = "";
    searchIyakuhinResult = [];
    isEditing = false;
    onFieldChange();
  }

  function doKizaiMasterSelect(m: KizaiMaster) {}
</script>

<Field>
  <FieldTitle>薬品名称</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="rep" on:click={doRepClick}>{drug.data.薬品レコード.薬品名称}</div>
    {:else}
      <div class="with-icons">
        <form on:submit|preventDefault={doSearch}>
          <input
            type="text"
            tabindex="0"
            bind:value={searchText}
            bind:this={inputElement}
            class="search-text"
          />
        </form>
        <SearchLink onClick={doSearch} />
        <EraserLink onClick={doClearSearchText} />
        {#if drug.data.薬品レコード.薬品コード !== ""}
          <CancelLink onClick={doCancel} />
        {/if}
      </div>
    {/if}
    {#if drug.data.薬品レコード.情報区分 === "医薬品" && searchIyakuhinResult.length > 0}
      <div class="search-result">
        {#each searchIyakuhinResult as master (master.iyakuhincode)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="master-item"
            on:click={() => doIyakuhinMasterSelect(master)}
          >
            {master.name}
          </div>
        {/each}
      </div>
    {:else if drug.data.薬品レコード.情報区分 === "医療材料" && searchKizaiResult.length > 0}
      <div class="search-result">
        {#each searchKizaiResult as master (master.kizaicode)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="master-item" on:click={() => doKizaiMasterSelect(master)}>
            {master.name}
          </div>
        {/each}
      </div>
    {/if}
  </FieldForm>
</Field>

<style>
  .rep {
    cursor: pointer;
  }

  .search-text {
    width: 18em;
  }

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
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
</style>
