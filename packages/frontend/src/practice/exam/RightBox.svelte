<script lang="ts">
  export let title: string = "";
</script>

<div class="top">
  <div class="title">{title}</div>
  <slot />
</div>

<style>
  .top {
    border: 1px solid gray;
    margin-bottom: 10px;
    padding: 10px;
  }
  .title {
    font-weight: bold;
  }
</style>