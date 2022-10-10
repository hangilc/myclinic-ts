<script type="ts">
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";
  import { onMount, afterUpdate, onDestroy } from "svelte";

  export let onClose: () => void;
  export let anchor: HTMLElement

  let menu: HTMLElement;
  let zIndexScreen: number;
  let zIndexMenu: number;
  
  onMount(() => {
    zIndexScreen = alloc();
    zIndexMenu = alloc();
  });
  
  afterUpdate(() => {
    locateAtAnchor(menu, anchor);
  });

  onDestroy(() => {
    release(zIndexScreen);
    release(zIndexMenu);
  });

  function locateAtAnchor(e: HTMLElement, anchor: HTMLElement) {
    const r = anchor.getBoundingClientRect();
    e.style.left = (window.scrollX + r.left) + "px";
    e.style.top = (window.scrollY + r.top + r.height + 4) + "px";
  }

</script>

<div>
  <Screen opacity="0" zIndex={zIndexScreen} onclick={onClose}/>
  <div bind:this={menu} class="menu" style:z-index={zIndexMenu}
    on:click={onClose}>
    <slot />
  </div>
</div>

<style>
  .menu {
    position: absolute;
    border: 1px solid gray;
    margin: 0;
  }
</style>