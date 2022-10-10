<script type="ts">
  export let title: string;
</script>

<div class="top">
  <div class="title">{title}</div><slot />
</div>

<style>
  .top {
    margin-bottom: 6px;
    display: flex;
    align-items: center;
  }

  .title {
    font-size: 1.5rem;
    display: inline-block;
    margin: 0;
    padding: 0;
  }
</style>