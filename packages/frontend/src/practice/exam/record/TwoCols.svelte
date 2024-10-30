<script lang="ts">
  export let isCurrent: boolean;
</script>

<div class="top">
  <div class="left" class:isCurrent={isCurrent}><slot name="left"></slot></div>
  <div class="right"><slot name="right"></slot></div>
</div>

<style>
  .top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .left.isCurrent {
    border-left: 3px solid orange;
    padding-left: 4px;
  }
</style>