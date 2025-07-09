<script lang="ts">
  export let onCancel: () => void;
</script>

<div class="top">
  <button on:click={onCancel}>キャンセル</button>
</div>

<style>
  .top {
    margin-bottom: 10px;
  }
</style>