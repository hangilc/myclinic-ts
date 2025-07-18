<script lang="ts">
  import type { 備考レコードEdit } from "../denshi-edit";
  import CancelLink from "../icons/CancelLink.svelte";
  import EraserLink from "../icons/EraserLink.svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";

  export let record: 備考レコードEdit;
  export let onChange: () => void;
  export let onDelete: (record: 備考レコードEdit) => void;

  let inputText: string = "";

  $: if (record.isEditing) {
    initInputText();
  }

  function initInputText(): void {
    inputText = record.備考;
  }

  function doDelete() {
    onDelete(record);
  }

  function doEnter() {
    let t = inputText.trim();
    if (t === "") {
      alert("備考の内容が空白です。");
      return;
    }
    record.備考 = t;
    record.isEditing = false;
    record = record;
    onChange();
  }

  function doErase() {
    inputText = "";
  }

  function doCancel() {
    record.isEditing = false;
    record = record;
  }

  function doRepClick() {
    record.isEditing = true;
    record = record;
  }
</script>

{#if !record.isEditing}
  <div class="with-icons">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="rep" on:click={doRepClick}>{record.備考}</span>
    <TrashLink onClick={doDelete} />
  </div>
{:else}
  <form on:submit|preventDefault={doEnter} class="with-icons">
    <input type="text" bind:value={inputText} />
    <SubmitLink onClick={doEnter} />
    <EraserLink onClick={doErase} />
    <CancelLink onClick={doCancel} />
    <TrashLink onClick={doDelete} />
  </form>
{/if}

<style>
  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .rep {
    cursor: pointer;
  }
</style>
