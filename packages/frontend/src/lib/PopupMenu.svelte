<script lang="ts">
  import { PopupContext } from "./popup-context";
  import type { PopupMenuItem } from "./popup-helper";
  import { ViewportCoord } from "./viewport-coord";
  import PopupMenuLink from "./PopupMenuLink.svelte";

  export let event: MouseEvent;
  export let menu: PopupMenuItem[];
  export let destroy: () => void;
  export let modifier: (menu: HTMLElement) => void = (_) => {};
  let context: PopupContext | undefined = undefined;

  event.preventDefault();

  function popupDestroy() {
    if (context) {
      context?.destroy();
    }
    destroy();
  }

  function open(e: HTMLElement) {
    const anchor = (event.currentTarget || event.target) as HTMLElement | SVGSVGElement;
    const clickLocation = ViewportCoord.fromEvent(event);
    context = new PopupContext(anchor, e, clickLocation, popupDestroy);
    modifier(e);
  }

</script>

<div use:open class="menu">
  {#each menu as m}
    <PopupMenuLink item={m} {popupDestroy}/>
  {/each}
</div>

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

  .menu :global(a + a) {
    margin-top: 4px;
  }

</style>
