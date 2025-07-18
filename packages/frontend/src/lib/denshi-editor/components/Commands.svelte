<script lang="ts">
  export let onEnter: () => void;
  export let onCancel: () => void;
</script>

<div class="top">
  <button on:click={onEnter}>入力</button>
  <button on:click={onCancel}>キャンセル</button>
</div>

<style>
  .top {
    margin-bottom: 10px;
  }
</style>