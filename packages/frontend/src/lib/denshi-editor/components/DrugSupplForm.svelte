<script lang="ts">
  import type { 薬品補足レコードEdit } from "../denshi-edit";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";
  import { tick } from "svelte";

  export let suppl: 薬品補足レコードEdit;
  export let onEnter: () => void;
  export let onCancel: () => void;
  export let onDelete: () => void;
  let inputText: string = suppl.薬品補足情報;
  let inputElement: HTMLInputElement | undefined = undefined;
  export const focus = async () => {
    await tick();
    inputElement?.focus();
  };

  function doEnter() {
    console.log("enter doEnter")
    if (inputText !== "") {
      suppl.薬品補足情報 = inputText;
      console.log("calling onEnter")
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
