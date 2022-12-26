<script type="ts">
  type T = $$Generic;
  export let data: T;
  export let onSelect: (t: T) => void = () => {};
  export let isCurrent: boolean = false;
  export let cursor: string = "default";

  function onClick() {
    onSelect(data);
  }
</script>

<div class="select-item" class:selected={isCurrent} 
    on:click={onClick} style:cursor={cursor}>
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