<script lang="ts">
  export let title: string;

  let show = false;

  function close(): void {
    show = false;
  }

  export function open(): void {
    show = true;
  }
</script>

{#if show}
<div class="top widget">
  <div class="title">{title}</div>
  <div class="body"><slot close={close} /></div>
  <div class="commands"><slot name="commands" /></div>
</div>
{/if}

<style>
  .top {
    border: 1px solid gray;
    margin: 10px 0;
    padding: 10px;
    width: 100%;
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

  .commands :global(a),
  .commands :global(button) {
    margin-left: 4px;
  }
</style>