<script type="ts">
  import type { Writable } from "svelte/store";

  export let selected: Writable<any>;
  export let data: any;

  function onClick() {
    selected.set(data);
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