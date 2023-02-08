<script lang="ts">
  export let title: string = "";
  export let display: boolean = true;
  export let dataCy: string = "";
</script>

<div class="top" style:display={display ? "block" : "none"} data-cy={dataCy}>
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