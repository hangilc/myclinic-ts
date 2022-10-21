<script lang="ts">
  export let title: string;

  function close(): void {
    this.$destroy();
  }
</script>

<div class="top widget">
  <div class="title">{title}</div>
  <div class="body"><slot close={close} /></div>
  <div class="commands"><slot name="commands" /></div>
</div>

<style>
  .top {
    border: 1px solid gray;
    margin: 10px 0;
    padding: 10px;
  }

  .title {
    font-weight: bold;
    background-color: #ddd;
    padding: 4px;
  }

  .body {
    margin: 10px 0;
    padding: 0 10px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
  }
</style>