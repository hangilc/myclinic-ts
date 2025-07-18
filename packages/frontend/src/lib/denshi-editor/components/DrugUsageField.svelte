<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import { tick } from "svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import type { RP剤情報Edit } from "../denshi-edit";
  import SearchLink from "../icons/SearchLink.svelte";
  import EraserLink from "../icons/EraserLink.svelte";
  import type { UsageMaster } from "myclinic-model";
  import api from "@/lib/api";

  export let group: RP剤情報Edit;
  export let isEditing: boolean;
  export let onFieldChange: () => void;
  if( group.用法レコード.用法コード === "") {
    isEditing = true;
  }
  const freeTextCode = "0X0XXXXXXXXX0000";
  let codeMode: "master" | "free" = codeModeValue();
  let searchText = group.用法レコード.用法名称;
  let inputElement: HTMLInputElement | undefined = undefined;
  let searchResult: UsageMaster[] = [];

  function codeModeValue() {
    let code = group.用法レコード.用法コード;
    return code == freeTextCode || code === ""
      ? "free"
      : "master";
  }

  function updateCodeMode() {
    let code = group.用法レコード.用法コード;
    codeMode =   code == freeTextCode || code === ""
      ? "free"
      : "master";
  }

  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  };

  function rep(group: RP剤情報Edit): string {
    return group.用法レコード.用法名称;
  }

  function doRepClick() {
    searchText = group.用法レコード.用法名称;
    isEditing = true;
  }

  async function doFormSubmit() {
    const t = searchText.trim();
    if( t === "" ){
      return;
    }
    if( codeMode === "master" ){
      searchResult = await api.selectUsageMasterByUsageName(t);
    } else {

    }
  }

  function doClearSearchText() {
    searchText = "";
  }

  function doCancel() {
    isEditing = false;
  }

  function doUsageMasterSelect(master: UsageMaster) {
    group.用法レコード.用法コード = master.usage_code;
    group.用法レコード.用法名称 = master.usage_name;
    isEditing = false;
    updateCodeMode();
    searchText = "";
    searchResult = [];
    onFieldChange();
  }
</script>

<Field>
  <FieldTitle>用法</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="rep" on:click={doRepClick}>
        {rep(group)}
        {#if group.用法レコード.用法コード === freeTextCode}
        （自由文章）
        {/if}
      </div>
    {:else}
      <div>
        <input
          type="radio"
          bind:group={codeMode}
          value="master"
          tabindex="-1"
        />
        マスター
        <input type="radio" bind:group={codeMode} value="free" tabindex="-1" />
        自由文章
      </div>
      <form on:submit|preventDefault={doFormSubmit} class="with-icons">
        <input
          class="input-text"
          type="text"
          tabindex="0"
          bind:value={searchText}
          bind:this={inputElement}
        />
        <SearchLink onClick={doFormSubmit} />
        <EraserLink onClick={doClearSearchText} />
        {#if group.用法レコード.用法コード !== ""}
          <CancelLink onClick={doCancel} />
        {/if}
      </form>
      {#if searchResult.length > 0}
        <div class="search-result">
          {#each searchResult as result (result.usage_code)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              style="cursor:pointer;"
              on:click={() => doUsageMasterSelect(result)}
            >
              {result.usage_name}
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

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .input-text {
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
</style>
