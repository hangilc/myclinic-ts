<script lang="ts">
  import api from "@/lib/api";
  import type { 用法レコード } from "../presc-info";
  import type { UsageMaster } from "myclinic-model";
  import { onMount } from "svelte";
  import { freeStyleUsageCode } from "../denshi-shohou";
  import XCircle from "@/icons/XCircle.svelte";
  import CheckCircle from "@/icons/CheckCircle.svelte";

  export let 用法: 用法レコード | undefined;
  export let onDone: (value: 用法レコード) => void;
  export let onCancel: () => void;
  let mode: "master" | "free-style" = "master";
  let inputText = "";
  let usageSearchResult: UsageMaster[] = [];
  let masterInputElement: HTMLInputElement;
  let freeStyleInputElement: HTMLInputElement;

  if (用法) {
    if (用法.用法コード !== freeStyleUsageCode) {
      mode = "master";
      inputText = 用法.用法名称;
    } else {
      mode = "free-style";
      inputText = 用法.用法名称;
    }
  }

  onMount(() => {
    if( mode === "master" ){
      masterInputElement.focus();
    } else if( mode === "free-style" ){
      freeStyleInputElement.focus();
    }
  })

  async function doSearchUsage() {
    const t = inputText.trim();
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
    const t = inputText.trim();
    if (t === "") {
      alert("用法が入力されていません。");
      return;
    }
    onDone({
      用法コード: freeStyleUsageCode,
      用法名称: t,
    });
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <div>
    <input type="radio" bind:group={mode} value="master" />
    マスター
    <input
      type="radio"
      bind:group={mode}
      value="free-style"
    /> 自由文章
    <a href="javascript:void(0)" style="position:relative;top:5px;margin-left:3px;" on:click={onCancel}>
      <XCircle  color="#999" width="22"/>
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
        bind:value={inputText}
        style="width:22em;"
        bind:this={freeStyleInputElement}
      />
    </form>
  {/if}
</div>
