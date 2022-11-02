<script type="ts">
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";
  import { afterUpdate } from "svelte";

  export let anchor: HTMLElement
  export let locator: (e: HTMLElement, anchor: HTMLElement) => void = locateAtAnchor;
  export let maxHeight: string = "260px";
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
    locator(menu, anchor);
  });

  function locateAtAnchor(e: HTMLElement, anchor: HTMLElement): void {
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
  <div use:setMenu class="menu pulldown" style:z-index={zIndexMenu}
    style:max-height={maxHeight}
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
    overflow: auto;
  }
</style>