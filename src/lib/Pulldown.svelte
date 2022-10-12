<script type="ts">
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";
  import { afterUpdate } from "svelte";

  export let anchor: HTMLElement
  let show = false;
  let menu: HTMLElement;
  let zIndexScreen: number;
  let zIndexMenu: number;
  
  export function open(): void {
    zIndexScreen = alloc();
    zIndexMenu = alloc();
    show = true;
  }

  function close(): void {
    show = false;
    release(zIndexScreen);
    release(zIndexMenu);
  }

  afterUpdate(() => {
    locateAtAnchor(menu, anchor);
  });

  function locateAtAnchor(e: HTMLElement, anchor: HTMLElement) {
    if( e != null ){
      const r = anchor.getBoundingClientRect();
      e.style.left = (window.scrollX + r.left) + "px";
      e.style.top = (window.scrollY + r.top + r.height + 4) + "px";
    }
  }

  function setMenu(e){
    menu = e;
  }
</script>

{#if show}
<div>
  <Screen opacity="0" zIndex={zIndexScreen} onclick={close}/>
  <div use:setMenu class="menu" style:z-index={zIndexMenu}
    on:click={close}>
    <slot />
  </div>
</div>
{/if}

<style>
  .menu {
    position: absolute;
    border: 1px solid gray;
    margin: 0;
  }
</style>