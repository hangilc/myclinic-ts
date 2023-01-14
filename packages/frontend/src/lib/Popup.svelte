<script lang="ts">
  import { PopupContext } from "./popup-context";
  import { ViewportCoord } from "./viewport-coord";

  let show = false;
  let anchor: HTMLElement | SVGSVGElement | undefined = undefined;
  let clickLocation: ViewportCoord | undefined = undefined;
  let context: PopupContext | undefined = undefined;
  export let triggerHook: () => Promise<void> = async () => {};

  function destroy(): void {
    console.log("Popup destroy");
    context?.destroy();
    show = false;
  }

  async function trigger(event: MouseEvent) {
    console.log("popup trigger", event.currentTarget);
    event.preventDefault();
    anchor = event.currentTarget as HTMLElement | SVGSVGElement;
    await triggerHook();
    console.log("anchor", anchor);
    show = true;
  }

  async function triggerClick(event: MouseEvent) {
    event.preventDefault();
    anchor = event.currentTarget as HTMLElement | SVGSVGElement;
    await triggerHook();
    clickLocation = ViewportCoord.fromEvent(event);
    show = true;
  }

  function open(
    e: HTMLElement): void {
    console.log("popup open", anchor);
    if( anchor != undefined ){
      context = new PopupContext(anchor, e, clickLocation, destroy);
    }
  }

  function doMenuKey(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.stopPropagation();
      destroy();
    }
  }
</script>

<slot {trigger} {triggerClick} {destroy} />
{#if show}
  <div class="menu" use:open on:keydown={doMenuKey} tabindex="0">
    <slot name="menu" />
  </div>
{/if}

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
