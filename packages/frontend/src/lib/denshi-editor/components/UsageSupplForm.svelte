<script lang="ts">
  import type { 用法補足レコードEdit } from "../denshi-edit";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";
  import { tick } from "svelte";

  export let suppl: 用法補足レコードEdit;
  export let onEnter: () => void;
  export let onCancel: () => void;
  export let onDelete: () => void;
  let inputText: string = suppl.用法補足情報;
  let inputElement: HTMLInputElement | undefined = undefined;
  export const focus = async () => {
    await tick();
    inputElement?.focus();
  };

  function doEnter() {
    if (inputText !== "") {
      suppl.用法補足情報 = inputText;
      onEnter();
    }
  }

  function doCancel() {
    onCancel();
  }

  function doDelete() {
    onDelete();
  }
</script>

<form on:submit|preventDefault={doEnter} class="with-icons">
  <input type="text" bind:value={inputText} bind:this={inputElement} />
  <SubmitLink onClick={doEnter} />
  <CancelLink onClick={doCancel} />
  <TrashLink onClick={doDelete} />
</form>

<style>
  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }
</style>
