<script lang="ts">
  import XCircle from "@/icons/XCircle.svelte";
  import type { UsageMaster } from "myclinic-model";
  import { onMount } from "svelte";
  import api from "@/lib/api";

  export let 用法コード: string;
  export let 用法名称: string;

  let isEditing = false;
  let mode: "master" | "free-style" = "master";
  let inputText = "";
  let masterInputElement: HTMLInputElement;
  let freeStyleInputElement: HTMLInputElement;
  let searchResult: UsageMaster[] = [];

  if (!用法コード) {
    isEditing = true;
  }

  onMount(() => {
    if (mode === "master") {
      masterInputElement.focus();
    } else if (mode === "free-style") {
      freeStyleInputElement.focus();
    }
  });

  function onCancel() {
    isEditing = false;
  }

  async function doSearchUsage() {
    const t = inputText.trim();
    if (t) {
      searchResult = await api.selectUsageMasterByUsageName(t);
    }
  }

  function doUsageMasterSelect(value: UsageMaster) {}

  function doFreeText() {}
</script>

{#if isEditing}
  <div>
    <input type="radio" bind:group={mode} value="master" />
    マスター
    <input type="radio" bind:group={mode} value="free-style" /> 自由文章
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a
      href="javascript:void(0)"
      style="position:relative;top:5px;margin-left:3px;"
      on:click={onCancel}
    >
      <XCircle color="#999" width="22" />
    </a>
  </div>
  {#if mode === "master"}
    <form on:submit|preventDefault={doSearchUsage}>
      <input
        type="text"
        bind:value={inputText}
        style="width:22em;"
        bind:this={masterInputElement}
      />
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
        bind:value={inputText}
        style="width:22em;"
        bind:this={freeStyleInputElement}
      />
    </form>
  {/if}
{/if}

<style>
  .search-result {
    height: 10em;
    overflow-y: auto;
    reize: vertical;
    font-size: 14px;
    margin-top: 6px;
    border: 1px solid gray;
  }
</style>
