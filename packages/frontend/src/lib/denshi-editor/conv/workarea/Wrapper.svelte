<script lang="ts">
</script>

<div class="workarea-wrapper"><slot /></div>

<style>
  .workarea-wrapper {
    --border: 2px solid #ccc;
    border: var(--border);
    border-radius: 6px;
    padding: 10px;
    margin-right: 10px;
    margin-bottom: 10px;
  }
</style>
