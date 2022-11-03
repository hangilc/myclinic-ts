<script type="ts">
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";
  import { afterUpdate } from "svelte";

  export let anchor: HTMLElement | SVGSVGElement;
  export let locator: (e: HTMLElement, anchor: HTMLElement | SVGSVGElement) => void =
    locateAtAnchor;
  export let maxHeight: string = "260px";
  let show = false;
  let menu: HTMLElement;
  let menuParent: HTMLElement;
  let zIndexScreen: number;
  let zIndexMenu: number;

  export function open(): void {
    zIndexScreen = alloc();
    zIndexMenu = alloc();
    show = true;
  }

  function close(): void {
    menuParent.appendChild(menu);
    show = false;
    release(zIndexScreen);
    release(zIndexMenu);
  }

  afterUpdate(() => {
    locator(menu, anchor);
  });

  function locateAtAnchor(e: HTMLElement, anchor: HTMLElement | SVGSVGElement): void {
    if (e != null) {
      const r = anchor.getBoundingClientRect();
      const t = e.getBoundingClientRect();
      const w = document.documentElement.clientWidth;
      if (r.left + t.width > w) {
        e.style.left = window.scrollX + w - t.width - 10 + "px";
      } else {
        e.style.left = window.scrollX + r.left + "px";
      }
      const h = document.documentElement.clientHeight;
      if (r.top + t.height > h) {
        e.style.top = window.scrollY + h - t.height - 10 + "px";
      } else {
        e.style.top = window.scrollY + r.top + r.height + 4 + "px";
      }
    }
  }

  function setMenu(e: HTMLElement) {
    menu = e;
    menuParent = e.parentElement;
    document.body.appendChild(e);
  }
</script>

{#if show}
  <div>
    <Screen opacity="0" zIndex={zIndexScreen} onclick={close} />
    <div
      use:setMenu
      class="menu pulldown"
      style:z-index={zIndexMenu}
      style:max-height={maxHeight}
      on:click={close}
    >
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
