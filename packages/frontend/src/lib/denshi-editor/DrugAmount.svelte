<script lang="ts">
  import { toHankaku } from "@/lib/zenkaku";
  import "./widgets/style.css";
  import CancelLink from "./icons/CancelLink.svelte";
  import SubmitLink from "./icons/SubmitLink.svelte";
  import { onMount, tick } from "svelte";

  export let 分量: string;
  export let isEditing: boolean;
  export let 単位名: string;

  let inputText: string = 分量;
  let inputElement: HTMLInputElement;

  $: if( isEditing ){
    focus();
  }

  async function focus() {
    await tick();
    if (inputElement) {
      inputElement.focus();
    }
  }

  function doEnter() {
    let f = parseFloat(toHankaku(inputText.trim()));
    if (isNaN(f)) {
      alert("分量の値が数値でありません。");
      return;
    }
    分量 = f.toString();
    inputText = 分量;
    isEditing = false;
  }

  function doCancel() {
    isEditing = false;
  }

  function doEdit() {
    inputText = 分量;
    isEditing = true;
  }
</script>

<div class="label">分量</div>
{#if isEditing}
  <form on:submit|preventDefault={doEnter} class="with-icons">
    <input type="text" bind:value={inputText} bind:this={inputElement} />
    {単位名}
    <SubmitLink onClick={doEnter} />
    <CancelLink onClick={doCancel} />
  </form>
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="rep" on:click={doEdit}>分量：{分量}{単位名}</div>
{/if}

<style>
  input {
    width: 4em;
  }

  .rep {
    cursor: pointer;
  }
</style>
