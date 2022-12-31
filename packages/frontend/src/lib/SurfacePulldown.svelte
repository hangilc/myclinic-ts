<script lang="ts">
  import { onDestroy } from "svelte";
  import { AbsoluteCoord } from "./absolute-coord";
  import { locateAtAnchor, locateAtPoint, locatePulldown } from "./locator";
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";

  export let wrapper: HTMLElement;
  export let anchor: HTMLElement | SVGSVGElement;
  export let destroy: () => void;
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
    if( anchor instanceof AbsoluteCoord ){
      // locateAtPoint(e, anchor);
    } else  {
      const wrapperStyle = window.getComputedStyle(wrapper);
      if( wrapperStyle.position !== "relative" ){
        console.error("pulldown wrapper should be position: relative");
        return;
      }
      document.body.appendChild(e);
      e.style.position = "absolute";
      e.style.left = "0px";
      e.style.top = "0px";
      e.style.width = "auto";
      const r = e.getBoundingClientRect();
      e.style.width = r.width + "px";
      e.style.height = r.height + "px";
      e.style.left = "";
      e.style.top = "";
      wrapper.appendChild(e);
      locatePulldown(wrapper, anchor, e);
    }
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
