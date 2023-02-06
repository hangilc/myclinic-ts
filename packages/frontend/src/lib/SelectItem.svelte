<script type="ts">
  import type { Writable } from "svelte/store";

  type T = $$Generic;
  export let selected: Writable<T | null>;
  export let data: T;
  export let onSelected: () => void = () => {};
  export let cursor: string = "default";

  function onClick() {
    selected.set(data);
    onSelected();
  }
</script>

<div class="select-item" class:selected={$selected === data} 
    on:click={onClick} style:cursor={cursor}
    >
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