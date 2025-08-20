<script lang="ts">
  import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
  import type { 薬品情報Edit } from "../denshi-edit";
  import CancelLink from "../icons/CancelLink.svelte";
  import EraserLink from "../icons/EraserLink.svelte";
  import SearchLink from "../icons/SearchLink.svelte";
  import Field from "./workarea/Field.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import api from "@/lib/api";
  import { tick } from "svelte";
  import SmallLink from "./workarea/SmallLink.svelte";
  import { cache } from "@/lib/cache";

  export let drug: 薬品情報Edit;
  export let isEditing: boolean;
  export let at: string;
  export let onFieldChange: () => void;
  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  };
  let searchText = drug.薬品レコード.薬品名称;
  let inputElement: HTMLInputElement;
  let searchIyakuhinResult: IyakuhinMaster[] = [];
  let searchKizaiResult: KizaiMaster[] = [];

  function doRepClick() {
    searchText = drug.薬品レコード.薬品名称;
    isEditing = true;
    focus();
  }

  async function doSearch() {
    let t = searchText.trim();
    if (t !== "") {
      if (drug.薬品レコード.情報区分 === "医薬品") {
        const examples = await cache.getPrescExample();
        console.log("example", examples);
        searchIyakuhinResult = await api.searchIyakuhinMaster(t, at);
      } else if (drug.薬品レコード.情報区分 === "医療材料") {
        searchKizaiResult = await api.searchKizaiMaster(t, at);
      }
    } else {
      searchIyakuhinResult = [];
      searchKizaiResult = [];
    }
  }

  function doClearSearchText() {
    searchText = "";
    focus();
  }

  function doCancel() {
    isEditing = false;
  }

  function doIyakuhinMasterSelect(m: IyakuhinMaster) {
    Object.assign(drug.薬品レコード, {
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

  function doKizaiMasterSelect(m: KizaiMaster) {
    Object.assign(drug.薬品レコード, {
      薬品コード種別: "レセプト電算処理システム用コード",
      薬品コード: m.kizaicode.toString(),
      薬品名称: m.name,
      単位名: m.unit,
    });
    drug.ippanmei = "";
    drug.ippanmeicode = "";
    searchText = "";
    searchKizaiResult = [];
    isEditing = false;
    onFieldChange();
  }

  function convertToIppanmei() {
    drug.convertToIppanmei();
    isEditing = false;
    onFieldChange();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Field>
  <FieldTitle>薬品名称</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <div>
        <span class="rep" on:click={doRepClick}
          >{drug.薬品レコード.薬品名称 || "（未設定）"}</span
        >
        {#if drug.isConvertibleToIppanmei()}
          <SmallLink onClick={convertToIppanmei}>一般名に</SmallLink>
        {/if}
      </div>
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
        <CancelLink onClick={doCancel} />
      </div>
    {/if}
    {#if drug.薬品レコード.情報区分 === "医薬品" && searchIyakuhinResult.length > 0}
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
    {:else if drug.薬品レコード.情報区分 === "医療材料" && searchKizaiResult.length > 0}
      <div class="search-result">
        {#each searchKizaiResult as master (master.kizaicode)}
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
