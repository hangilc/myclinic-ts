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

  export let drug: 薬品情報Wrapper;
  export let isEditing: boolean;
  export let at: string;
  let searchText = drug.data.薬品レコード.薬品名称;
  let inputElement: HTMLInputElement;
  let searchIyakuhinResult: IyakuhinMaster[] = [];
  let searchKizaiResult: KizaiMaster[] = [];

  async function doSearch() {
    let t = searchText.trim();
    if (t !== "") {
      if (drug.data.薬品レコード.情報区分 === "医薬品") {
        searchIyakuhinResult = await api.searchIyakuhinMaster(t, at);
      } else {
        searchKizaiResult = await api.searchKizaiMaster(t, at);
      }
    }
  }

  function doClearSearchText() {
    searchText = "";
  }

  function doCancel() {}

  function doIyakuhinMasterSelect(m: IyakuhinMaster) {
    searchIyakuhinResult = [];
  }

  function doKizaiMasterSelect(m: KizaiMaster) {}
</script>

<Field>
  <FieldTitle>薬品名称</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <div>{drug.data.薬品レコード.薬品名称}</div>
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
    {#if drug.data.薬品レコード.情報区分 === "医薬品"}
      {#each searchIyakuhinResult as master (master.iyakuhincode)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="master-item"
          on:click={() => doIyakuhinMasterSelect(master)}
        >
          {master.name}
        </div>
      {/each}
    {:else if drug.data.薬品レコード.情報区分 === "医療材料"}
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
