<script lang="ts">
  import XCircle from "@/icons/XCircle.svelte";
  import type { UsageMaster } from "myclinic-model";
  import { onMount } from "svelte";
  import api from "@/lib/api";
  import MagnifyingGlass from "@/icons/MagnifyingGlass.svelte";
  import Trash from "@/icons/Trash.svelte";

  export let 用法コード: string;
  export let 用法名称: string;

  let isEditing = false;
  let mode: "master" | "free-style" = "master";
  let searchText = "";
  let masterInputElement: HTMLInputElement;
  let freeStyleInputElement: HTMLInputElement;
  let searchResult: UsageMaster[] = [];

  export const focus: () => void = () => {
    if (mode === "master") {
      masterInputElement.focus();
    } else if (mode === "free-style") {
      freeStyleInputElement.focus();
    }
  };

  if (!用法コード) {
    isEditing = true;
  }

  function onCancel() {
    isEditing = false;
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
    用法コード = "0X0XXXXXXXXX0000";
    用法名称 = t;
    isEditing = false;
  }

  function editingMode() {
    searchText = 用法名称;
    isEditing = true;
  }

  function doClearSearchText() {
    searchText = "";
    searchResult = [];
    masterInputElement?.focus();
  }

  function doCancel() {
    if (用法コード) {
      isEditing = false;
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-invalid-attribute -->
{#if isEditing}
  <div>
    <input type="radio" bind:group={mode} value="master" tabindex="-1" />
    マスター
    <input type="radio" bind:group={mode} value="free-style" tabindex="-1" /> 自由文章
    <!-- svelte-ignore a11y-invalid-attribute -->
  </div>
  {#if mode === "master"}
    <form on:submit|preventDefault={doSearchUsage}>
      <input
        class="input-text"
        type="text"
		tabindex="0"
        bind:value={searchText}
        bind:this={masterInputElement}
      />
      <a
        href="javascript:void(0)"
        style="position:relative;top:5px;margin-left:3px;"
		tabindex="-1"
        on:click={doSearchUsage}><MagnifyingGlass /></a
      >
      {#if searchText.length > 0}
        <a
          href="javascript:void(0)"
          style="position:relative;top:5px;margin-left:-4px;"
		  tabindex="-1"
          on:click={doClearSearchText}
        >
          <Trash color="#999" />
        </a>
      {/if}
      {#if 用法コード}
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
        bind:value={searchText}
        style="width:22em;"
        bind:this={freeStyleInputElement}
      />
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
