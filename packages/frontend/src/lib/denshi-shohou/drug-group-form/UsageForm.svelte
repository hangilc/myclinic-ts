<script lang="ts">
  import api from "@/lib/api";
  import type { 用法レコード } from "../presc-info";
  import type { UsageMaster } from "myclinic-model";
  import { onMount } from "svelte";

  export let 用法: 用法レコード | undefined;
  export let onDone: (value: 用法レコード) => void;
  const freeStyleUsageCode = "0X0XXXXXXXXX0000";
  let mode: "master" | "free-style" = "master";
  let usageSearchText = "";
  let usageSearchResult: UsageMaster[] = [];
  let usageSearchElement: HTMLInputElement;
  let freeTextElement: HTMLInputElement;
  let freeText = "";
  if (用法) {
    if (用法.用法コード !== freeStyleUsageCode) {
      mode = "master";
      usageSearchText = 用法.用法名称;
    } else {
      mode = "free-style";
      freeText = 用法.用法名称;
    }
  }

  onMount(() => {
    setFocus();
  });

  async function setFocus() {
    if (mode === "master") {
      usageSearchElement?.focus();
    } else if (mode === "free-style") {
      freeTextElement?.focus();
    }
  }

  async function doSearchUsage() {
    const t = usageSearchText.trim();
    if (t !== "") {
      usageSearchResult = await api.selectUsageMasterByUsageName(t);
    }
  }

  function doUsageMasterSelect(m: UsageMaster) {
    onDone({
      用法コード: m.usage_code,
      用法名称: m.usage_name,
    });
  }

  function doFreeText() {
    const t = freeText.trim();
    if (t === "") {
      alert("用法が入力されていません。");
      return;
    }
    onDone({
      用法コード: freeStyleUsageCode,
      用法名称: freeText,
    });
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <div>
    <input type="radio" bind:group={mode} value="master" on:change={setFocus} />
    マスター
    <input
      type="radio"
      bind:group={mode}
      value="free-style"
      on:change={setFocus}
    /> 自由文章
  </div>
  {#if mode === "master"}
    <form on:submit|preventDefault={doSearchUsage}>
      <input
        type="text"
        bind:value={usageSearchText}
        bind:this={usageSearchElement}
        style="width:22em;"
      />
    </form>
    <div
      style="height:10em;overflow-y:auto;reize:vertical;font-size: 14px;margin-top:6px;border:1px solid gray;"
    >
      {#each usageSearchResult as result (result.usage_code)}
        <div
          style="cursor:pointer;"
          on:click={() => doUsageMasterSelect(result)}
        >
          {result.usage_name}
        </div>
      {/each}
    </div>
  {:else if mode === "free-style"}
    <form on:submit|preventDefault={doFreeText}>
      <input
        type="text"
        bind:value={freeText}
        bind:this={freeTextElement}
        style="width:22em;"
      />
    </form>
  {/if}
</div>
