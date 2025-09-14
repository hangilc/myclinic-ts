<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import type { RP剤情報Edit } from "../denshi-edit";
  import SearchLink from "../icons/SearchLink.svelte";
  import EraserLink from "../icons/EraserLink.svelte";
  import type { UsageMaster } from "myclinic-model";
  import api from "@/lib/api";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import { cache } from "@/lib/cache";
  import ChevronDownLink from "../icons/ChevronDownLink.svelte";
  import { tick } from "svelte";

  export let group: RP剤情報Edit;
  export let isEditing: boolean;
  export let onFieldChange: () => void;
  const freeTextCode = "0X0XXXXXXXXX0000";
  let codeMode: "master" | "free" | undefined = undefined;
  $: updateCodeMode(group);
  let searchText: string = "";
  $: updateSearchText(group);
  let inputElement: HTMLInputElement | undefined = undefined;
  let searchResult: UsageMaster[] = [];
  let presetUsage: string[] = [];
  let showPreset: boolean = false;

  updatePresetUsage();

  function updateCodeMode(group: RP剤情報Edit): void {
    let code = group.用法レコード.用法コード;
    let value: "master" | "free" | undefined;
    if (code === freeTextCode) {
      value = "free";
    } else if (code === "") {
      value = undefined;
    } else {
      value = "master";
    }
    codeMode = value;
  }

  function updateSearchText(group: RP剤情報Edit) {
    searchText = group.用法レコード.用法名称;
  }

  async function updatePresetUsage() {
    presetUsage = await cache.getPresetUsage();
  }

  // function updateCodeMode() {
  //   codeMode = codeModeValue();
  // }

  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  };

  function rep(group: RP剤情報Edit): string {
    let s = group.用法レコード.用法名称;
    if (s === "") {
      s = "（未設定）";
    }
    return s;
  }

  function doRepClick() {
    searchText = group.用法レコード.用法名称;
    isEditing = true;
  }

  async function doFormSubmit() {
    const t = searchText.trim();
    if (t === "") {
      return;
    }
    if (codeMode === "master") {
      searchResult = await api.selectUsageMasterByUsageName(t);
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
    // updateCodeMode();
    searchText = "";
    searchResult = [];
    onFieldChange();
  }

  function doSubmitFree(): void {
    let t = searchText.trim();
    if (t === "") {
      return;
    }
    group.用法レコード.用法コード = freeTextCode;
    group.用法レコード.用法名称 = t;
    isEditing = false;
    onFieldChange();
  }

  function doTogglePreset() {
    showPreset = !showPreset;
  }

  async function doPresetUsageClick(presetValue: string) {
    const trimmedValue = presetValue.trim();
    if (trimmedValue === "") {
      return;
    }

    const freePrefix = "free:";
    if (trimmedValue.startsWith(freePrefix)) {
      const value = trimmedValue.substring(freePrefix.length);
      group.用法レコード.用法コード = freeTextCode;
      group.用法レコード.用法名称 = value;
    } else {
      const master = await api.findUsageMasterByUsageName(trimmedValue);

      if (master) {
        group.用法レコード.用法コード = master.usage_code;
        group.用法レコード.用法名称 = master.usage_name;
      }
    }

    isEditing = false;
    searchText = "";
    searchResult = [];
    showPreset = false;
    onFieldChange();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Field>
  <FieldTitle>用法</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <div class="rep" on:click={doRepClick}>
        {rep(group)}
        {#if group.用法レコード.用法コード === freeTextCode}
          （自由文章）
        {:else if group.用法レコード.用法コード === ""}
          （コードなし）
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
        {#if codeMode === "master"}
          <SearchLink onClick={doFormSubmit} />
        {:else if codeMode === "free"}
          <SubmitLink onClick={doSubmitFree} />
        {/if}
        <EraserLink onClick={doClearSearchText} />
        <CancelLink onClick={doCancel} />
        <ChevronDownLink onClick={doTogglePreset} />
      </form>
      {#if showPreset}
        <div class="preset">
          {#each presetUsage as preset}
            <div
              on:click={() => doPresetUsageClick(preset)}
              class="cursor-pointer preset-item"
            >
              {preset}
            </div>
          {/each}
        </div>
      {/if}
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

  .preset {
    margin: 10px 0;
    border: 1px solid gray;
    padding: 10px;
  }

  .preset-item:hover {
    background-color: #eee;
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
