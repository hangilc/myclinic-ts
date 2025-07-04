<script lang="ts">
  import XCircle from "@/icons/XCircle.svelte";
  import type { UsageMaster } from "myclinic-model";
  import api from "@/lib/api";
  import Eraser from "@/icons/Eraser.svelte";
  import CheckCircle from "@/icons/CheckCircle.svelte";
  import CancelIcon from "./icons/CancelIcon.svelte";
  import "./widgets/style.css";
  import SearchLink from "./icons/SearchLink.svelte";
  import EraserLink from "./icons/EraserLink.svelte";
  import CancelLink from "./icons/CancelLink.svelte";

  export let 用法コード: string;
  export let 用法名称: string;
  export let isEditing = false;

  let mode: "master" | "free-style" = "master";
  let searchText = 用法名称;
  let masterInputElement: HTMLInputElement;
  let freeStyleInputElement: HTMLInputElement;
  let searchResult: UsageMaster[] = [];

  const freeTextCode = "0X0XXXXXXXXX0000";

  export const focus: () => void = () => {
    if (mode === "master") {
      masterInputElement?.focus();
    } else if (mode === "free-style") {
      freeStyleInputElement?.focus();
    }
  };

  if (!用法コード) {
    isEditing = true;
  }

  function doModeChanged() {
    searchText = 用法名称;
    searchResult = [];
    focus();
  }

  async function doSearchUsage() {
    const t = searchText.trim();
    if (t) {
      searchResult = await api.selectUsageMasterByUsageName(t);
    }
  }

  function doUsageMasterSelect(value: UsageMaster) {
    用法コード = value.usage_code;
    用法名称 = value.usage_name;
    isEditing = false;
    searchText = "";
    searchResult = [];
  }

  function doFreeText() {
    let t = searchText.trim();
    if (t === "") {
      alert("用法が入力されていません。");
      return;
    }
    用法コード = freeTextCode;
    用法名称 = t;
    isEditing = false;
  }

  function editingMode() {
    searchText = 用法名称;
    isEditing = true;
  }

  function doClearSearchText() {
    searchText = "";
    focus();
    if (mode === "master") {
      searchResult = [];
    }
  }

  function doCancel() {
    if (用法コード) {
      isEditing = false;
    }
  }
</script>

<div class="label">用法</div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-invalid-attribute -->
{#if isEditing}
  <div>
    <input
      type="radio"
      bind:group={mode}
      value="master"
      tabindex="-1"
      on:change={doModeChanged}
    />
    マスター
    <input
      type="radio"
      bind:group={mode}
      value="free-style"
      tabindex="-1"
      on:change={doModeChanged}
    />
    自由文章
    <!-- svelte-ignore a11y-invalid-attribute -->
  </div>
  {#if mode === "master"}
    <form on:submit|preventDefault={doSearchUsage} class="with-icons">
      <input
        class="input-text"
        type="text"
        tabindex="0"
        bind:value={searchText}
        bind:this={masterInputElement}
      />
      <SearchLink onClick={doSearchUsage} />
      <EraserLink onClick={doClearSearchText}/>
      {#if 用法コード}
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
  {:else if mode === "free-style"}
    <form on:submit|preventDefault={doFreeText}>
      <input
        type="text"
        class="input-text"
        bind:value={searchText}
        bind:this={freeStyleInputElement}
      />
      {#if searchText.length > 0}
        <a
          href="javascript:void(0)"
          on:click={doFreeText}
          style="position:relative;top:5px;"
          tabindex="-1"
        >
          <CheckCircle color="#007bff" />
        </a>
        <a
          href="javascript:void(0)"
          style="position:relative;top:5px;margin-left:-4px;"
          tabindex="-1"
          on:click={doClearSearchText}
        >
          <Eraser />
        </a>
      {/if}
      {#if 用法コード}<CancelIcon onClick={doCancel} style="margin-left:-2px;"/>
      {/if}
    </form>
  {/if}
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="usage-rep" on:click={editingMode}>
    {用法名称 || "（用法未設定）"}
  </div>
{/if}

<style>
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

  .usage-rep {
    cursor: pointer;
  }
</style>
