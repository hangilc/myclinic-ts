<script lang="ts">
  import { windowResized } from "@/app-events";
  import { onDestroy } from "svelte";
  import { locateAtAnchor, locateAtPoint } from "./locator";
  import Screen from "./Screen.svelte";
  import { ViewportCoord } from "./viewport-coord";
  import { alloc, release } from "./zindex";

  export let anchor: HTMLElement | SVGSVGElement | ViewportCoord;
  export let destroy: () => void;
  export let maxHeight: string | undefined = undefined;
  export let onClose: () => void = () => {};

  let zIndexScreen = alloc();
  let zIndexContent = alloc();
  const unsubs: (() => void)[] = [];
  let element: HTMLElement | undefined = undefined;

  unsubs.push(windowResized.subscribe((e) => onWindowResized(e)));

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
    unsubs.forEach(f => f());
  });

  function onWindowResized(e: UIEvent | undefined): void {
    if( element != undefined ){
      content(element);
    }
  }

  function doScreenClick(ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    destroy();
  }

  function content(e: HTMLElement): void {
    if( anchor instanceof ViewportCoord ){
      locateAtPoint(e, anchor);
    } else  {
      locateAtAnchor(e, anchor);
    }
    element = e;
  }
</script>

<div
  class="top"
  style:z-index={zIndexContent}
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
    height: auto;
    background-color: white;
    padding: 10px;
    opacity: 1;
    overflow: auto;
    border: 1px solid gray;
    box-sizing: border-box;
  }
</style>
