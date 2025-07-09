<script lang="ts">
  export let visible = true;
</script>

{#if visible}
  <div class="top"><slot /></div>
{/if}

<style>
  .top {
    margin-top: 6px;
    margin-bottom: 6px;
  }
</style>
