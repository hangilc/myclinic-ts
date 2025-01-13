<script lang="ts">
  import { onMount } from "svelte";
  import type { 用法補足レコード } from "../presc-info";

  export let 用法補足レコード: 用法補足レコード[];
  export let onDone: (value: 用法補足レコード[]) => void;
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
        ...用法補足レコード,
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
        ...用法補足レコード,
        {
          用法補足区分: kubun,
          用法補足情報: t,
        },
      ]);
    }
  }

  function doDelete(rec: 用法補足レコード) {
    const recs = [...用法補足レコード].filter(r => r !== rec);
    onDone(recs);
  }
</script>

<div>
  <ul>
    {#each 用法補足レコード as rec}
      <li>{rec.用法補足区分}：{rec.用法補足情報}
        <a href="javascript:void(0)" on:click={() => doDelete(rec)}>削除</a>
      </li>
    {/each}
  </ul>
</div>
<div class="option-wrapper">
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
      value="用法の続き"
      on:change={doChangeOption}
    />用法の続き</span
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
<div>
  {#if kubun === "用法の続き" || kubun === "部位" || kubun === "１回使用量"}
    <form on:submit|preventDefault={doSubmit}>
      <input type="text" bind:value={inputText} bind:this={inputElement} />
    </form>
  {/if}
</div>

<style>
  .option-wrapper > span {
    white-space: nowrap;
  }
</style>
