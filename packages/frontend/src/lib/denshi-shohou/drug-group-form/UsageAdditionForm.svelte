<script lang="ts">
  import { onMount } from "svelte";
  import type { 用法補足レコード } from "../presc-info";
  import XCircle from "@/icons/XCircle.svelte";
  import Trash from "@/icons/Trash.svelte";
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import CheckCircle from "@/icons/CheckCircle.svelte";

  export let 用法補足レコード: 用法補足レコード[] | undefined;
  export let onDone: (value: 用法補足レコード[] | undefined) => void;
  export let onClose: () => void;
  let inputElement: HTMLInputElement;
  let kubun:
    | "漸減"
    | "一包化"
    | "隔日"
    | "粉砕"
    | "用法の続き"
    | "部位"
    | "１回使用量" = "用法の続き";
  let inputText = "";
  let showAux = false;

  onMount(setFocus);

  function setFocus() {
    if (kubun === "用法の続き" || kubun === "部位" || kubun === "１回使用量") {
      inputElement?.focus();
    }
  }

  function doChangeOption() {
    if (kubun === "用法の続き" || kubun === "部位" || kubun === "１回使用量") {
      setFocus();
    } else {
      onDone([
        ...(用法補足レコード ?? []),
        {
          用法補足区分: kubun,
          用法補足情報: kubun,
        },
      ]);
    }
  }

  function doSubmit() {
    if (kubun === "用法の続き" || kubun === "部位" || kubun === "１回使用量") {
      const t = inputText.trim();
      if (t === "") {
        alert("入力がありません。");
        return;
      }
      onDone([
        ...(用法補足レコード ?? []),
        {
          用法補足区分: kubun,
          用法補足情報: t,
        },
      ]);
    }
  }

  function doDelete(rec: 用法補足レコード) {
    const recs = [...(用法補足レコード ?? [])].filter((r) => r !== rec);
    onDone(recs.length === 0 ? undefined : recs);
  }
</script>

<div>
  {#if 用法補足レコード}
    <ul style="margin-top:0;margin-bottom:6px;">
      {#each 用法補足レコード as rec}
        <li>
          {rec.用法補足区分}：{rec.用法補足情報}
          <a
            href="javascript:void(0)"
            on:click={() => doDelete(rec)}
            style="position:relative;top:3px;margin-left:6px;--trash-stroke:gray;"
          >
            <Trash />
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
<div class="option-wrapper">
  <span
    ><input
      type="radio"
      bind:group={kubun}
      value="用法の続き"
      on:change={doChangeOption}
    />用法の続き</span
  >
  <a
    href="javascript:void(0)"
    on:click={() => (showAux = !showAux)}
    style="position:relative;top:3px;"
  >
    <ChevronDown />
  </a>
  <a
    href="javascript:void(0)"
    style="position:relative;top:5px;margin-left:3px;"
    on:click={onClose}
  >
    <XCircle color="#999" width="22" />
  </a>
</div>
{#if showAux}
  <div style="margin-top:6px;margin-bottom:6px;" class="option-wrapper">
    <span
      ><input
        type="radio"
        bind:group={kubun}
        value="漸減"
        on:change={doChangeOption}
      />漸減</span
    >
    <span
      ><input
        type="radio"
        bind:group={kubun}
        value="一包化"
        on:change={doChangeOption}
      />一包化</span
    >
    <span
      ><input
        type="radio"
        bind:group={kubun}
        value="隔日"
        on:change={doChangeOption}
      />隔日</span
    >
    <span
      ><input
        type="radio"
        bind:group={kubun}
        value="粉砕"
        on:change={doChangeOption}
      />粉砕</span
    >
    <span
      ><input
        type="radio"
        bind:group={kubun}
        value="部位"
        on:change={doChangeOption}
      />部位</span
    >
    <span
      ><input
        type="radio"
        bind:group={kubun}
        value="１回使用量"
        on:change={doChangeOption}
      />１回使用量</span
    >
  </div>
{/if}
{#if kubun === "用法の続き" || kubun === "部位" || kubun === "１回使用量"}
  <div style="margin-top:6px;">
    <input type="text" bind:value={inputText} bind:this={inputElement} />
    <a
      href="javascript:void(0)"
      style="position:relative;top:5px;margin-left:3px;"
      on:click={doSubmit}
    >
      <CheckCircle color="#999" width="22" />
    </a>
  </div>
{/if}

<style>
  .option-wrapper > span {
    white-space: nowrap;
  }
</style>
