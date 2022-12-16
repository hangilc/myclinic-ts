<script lang="ts">
  import { writable, type Writable } from "svelte/store";

  export let nen: number;
  export let gengou: string;
  let anchor: HTMLElement;
  export let onChange: (nen: number) => void;

  let selected: Writable<number> = writable(nen);
  selected.subscribe(onChange);

  function doClick(): void {
  }
</script>

<span on:click={doClick} class="top" bind:this={anchor}>
  {nen}
</span>

<style>
  .top {
    user-select: none;
  }
</style>