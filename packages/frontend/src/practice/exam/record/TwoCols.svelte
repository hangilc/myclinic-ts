<script lang="ts">
  export let isCurrent: boolean;
</script>

<div class="top">
  <div class="left" class:isCurrent={isCurrent}><slot name="left"></slot></div>
  <div class="right"><slot name="right"></slot></div>
</div>

<style>
  .top {
    display: flex;
    align-items: flex-start;
  }

  .left {
    flex: 0 0 50%;
    padding-right: 4px;
  }

  .left.isCurrent {
    border-left: 3px solid orange;
    padding-left: 4px;
  }

  .right {
    flex: 0 0 50%;
    padding-left: 4px;
  }
</style>