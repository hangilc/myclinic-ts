<script lang="ts">
  import type { 検査値データ等レコードEdit } from "../denshi-edit";
  import CancelLink from "../icons/CancelLink.svelte";
  import EraserLink from "../icons/EraserLink.svelte";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";

  export let record: 検査値データ等レコードEdit;
  export let onChange: () => void;
  export let onDelete: (record: 検査値データ等レコードEdit) => void;

  let inputText: string = "";

  $: if (record.isEditing) {
    initInputText();
  }

  function initInputText(): void {
    inputText = record.検査値データ等;
  }

  function doDelete() {
    onDelete(record);
  }

  function doEnter() {
    let t = inputText.trim();
    if (t === "") {
      alert("提供診療情報の内容が空白です。");
      return;
    }
    record.検査値データ等 = t;
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
  <div class="with-icons top">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="rep" on:click={doRepClick}>{record.検査値データ等}</span>
    <TrashLink onClick={doDelete} />
  </div>
{:else}
  <form on:submit|preventDefault={doEnter} class="with-icons top">
    <input type="text" bind:value={inputText} />
    <SubmitLink onClick={doEnter} />
    <EraserLink onClick={doErase} />
    <CancelLink onClick={doCancel} />
    <TrashLink onClick={doDelete} />
  </form>
{/if}

<style>
  .top {
    margin: 6px 0;
  }
  
  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .rep {
    cursor: pointer;
  }
</style>
