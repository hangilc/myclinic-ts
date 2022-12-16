<script type="ts">
  import type { Writable } from "svelte/store";

  type T = $$Generic;
  export let selected: Writable<T | null>;
  export let data: T;
  export let autoselect = false;
  export let onSelected: () => void = () => {};

  if( autoselect && $selected == null ){
    selected.set(data);
  }

  function onClick() {
    selected.set(data);
    onSelected();
  }
</script>

<div class="select-item" class:selected={$selected === data} 
    on:click={onClick}>
  <slot />
</div>

<style>
  .select-item {
    cursor: default;
  }
  .select-item:hover {
    background-color: #eee;
  }

  .select-item.selected {
    background-color: #ccc;
  }
</style>