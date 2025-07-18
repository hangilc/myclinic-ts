<script lang="ts">
  import ChevronDownLink from "../icons/ChevronDownLink.svelte";

  export let onEnter: () => void;
  export let onCancel: () => void;
  export let onChevronDown: () => void;
</script>

<div class="top">
  <button on:click={onEnter}>入力</button>
  <button on:click={onCancel}>キャンセル</button>
  <ChevronDownLink onClick={onChevronDown} />
</div>

<style>
  .top {
    margin-bottom: 10px;
  }
</style>