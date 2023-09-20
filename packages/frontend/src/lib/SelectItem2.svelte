<script lang="ts">
  type T = $$Generic;
  export let data: T;
  export let onSelect: (t: T) => void = () => {};
  export let isCurrent: boolean = false;
  export let cursor: string = "default";
  export let dataCy: string | undefined = undefined;
  export let dataId: string | undefined = undefined;

  function onClick() {
    onSelect(data);
  }
</script>

<div class="select-item" class:selected={isCurrent} 
    on:click={onClick} style:cursor={cursor}
    data-cy={dataCy} data-id={dataId}>
  <slot />
</div>

<style>
  .select-item:hover {
    background-color: #eee;
  }

  .select-item.selected {
    background-color: #ccc;
  }
</style>