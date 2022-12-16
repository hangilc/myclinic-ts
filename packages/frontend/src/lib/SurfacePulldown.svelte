<script lang="ts">
  import { onDestroy } from "svelte";
  import { locateAtAnchor } from "./locator";
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";

  export let anchor: HTMLElement | SVGSVGElement;
  export let destroy: () => void;
  export let width: string = "auto";
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
    locateAtAnchor(e, anchor);
  }
</script>

<div
  class="top dialog-top"
  style:z-index={zIndexContent}
  style:width
  style:height
  use:content
>
  <div>
    <slot />
  </div>
</div>

<style>
  .top {
    position: fixed;
    display: inline-block;
    width: auto;
    background-color: white;
    padding: 10px;
    opacity: 1;
    overflow: auto;
    border: 1px solid gray;
  }
</style>
