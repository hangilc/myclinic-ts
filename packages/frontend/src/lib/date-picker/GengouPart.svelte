<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import GengouPulldown from "./GengouPulldown.svelte";


  export let gengou: string;
  export let gengouList: string[];
  let anchor: HTMLElement;
  export let onChange: (gengou: string) => void;

  let selected: Writable<string> = writable(gengou);
  selected.subscribe(onChange);

  function doClick(): void {
    const d: GengouPulldown = new GengouPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor,
        gengouList,
        selected,
      }
    });
  }
</script>

<span on:click={doClick} class="top" bind:this={anchor}>
  {gengou}
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
  }
</style>