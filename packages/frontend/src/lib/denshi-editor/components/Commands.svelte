<script lang="ts">
  import ChevronDownLink from "../icons/ChevronDownLink.svelte";
  import ChevronUpLink from "../icons/ChevronUpLink.svelte";
  import PlusLink from "../icons/PlusLink.svelte";

  export let onAdd: () => void;
  export let onEnter: () => void;
  export let onBatch: () => void;
  export let onSearch: () => void;
  export let onPaste: () => void;
  export let onCancel: () => void;
  export let showSubCommands: boolean;
</script>

<div class="top">
  <PlusLink onClick={onAdd}/>
  <button on:click={onEnter}>入力</button>
  <button on:click={onBatch}>選択</button>
  <button on:click={onSearch}>検索</button>
  <button on:click={onPaste}>貼付</button>
  <button on:click={onCancel}>キャンセル</button>
  {#if !showSubCommands}
    <ChevronDownLink onClick={() => (showSubCommands = true)} />
  {:else}
    <ChevronUpLink onClick={() => (showSubCommands = false)} />
  {/if}
</div>

<style>
  .top {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
</style>
