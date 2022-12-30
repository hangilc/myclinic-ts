<script lang="ts">
  import { onDestroy } from "svelte";
  import { locateAtAnchor, locateAtPoint } from "./locator";
  import Screen from "./Screen.svelte";
  import type { ViewportCoord } from "./viewport-coord";
  import { alloc, release } from "./zindex";

  export let anchor: HTMLElement | SVGSVGElement | ViewportCoord;
  export let destroy: () => void;
  export let height: string = "auto";
  export let maxHeight: string | undefined = undefined;
  export let onClose: () => void = () => {};

  let zIndexScreen = alloc();
  let zIndexContent = alloc();

  const screen = new Screen({
    target: document.body,
    props: {
      zIndex: zIndexScreen,
      opacity: "0",
      onClick: doScreenClick,
    },
  });

  onDestroy(() => {
    screen.$destroy();
    release(zIndexContent);
    release(zIndexScreen);
    onClose();
  });

  function doScreenClick(ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    destroy();
  }

  function content(e: HTMLElement): void {
    if (anchor instanceof HTMLElement || anchor instanceof SVGSVGElement) {
    } else {
      locateAtPoint(e, anchor);
    }
  }
</script>

<div
  class="top"
  style:z-index={zIndexContent}
  style:height
  style:max-height={maxHeight}
  use:content
>
  <div>
    <slot />
  </div>
</div>

<style>
  .top {
    position: absolute;
    display: block;
    width: auto;
    background-color: white;
    padding: 10px;
    opacity: 1;
    overflow: auto;
    border: 1px solid gray;
    box-sizing: border-box;
  }
</style>
