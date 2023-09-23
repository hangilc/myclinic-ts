<script lang="ts">
  import { PopupContext } from "./popup-context";
  import { ViewportCoord } from "./viewport-coord";

  export let destroy: () => void;
  export let locator: (e: HTMLElement, dispose: () => void) => (() => void);
  
  let discard: () => void = () => {};
  // async function trigger(event: MouseEvent) {
  //   event.preventDefault();
  //   anchor = event.currentTarget as HTMLElement | SVGSVGElement;
  //   await triggerHook();
  //   show = true;
  // }

  // async function triggerClick(event: MouseEvent) {
  //   event.preventDefault();
  //   anchor = event.currentTarget as HTMLElement | SVGSVGElement;
  //   await triggerHook();
  //   clickLocation = ViewportCoord.fromEvent(event);
  //   show = true;
  // }

  function dispose() {
    discard();
    destroy();
  }

  function open(e: HTMLElement): void {
    discard = locator(e, dispose);
  }

  function doMenuKey(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.stopPropagation();
      destroy();
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="menu" on:keydown={doMenuKey} use:open tabindex="0"><slot {dispose}/></div>

<style>
  .menu {
    position: absolute;
    margin: 0;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid gray;
    background-color: white;
    opacity: 1;
  }

  .menu:focus {
    outline: none;
  }
</style>
