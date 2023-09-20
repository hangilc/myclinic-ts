<script lang="ts">
  import { PopupContext } from "./popup-context";
  import { ViewportCoord } from "./viewport-coord";

  export let event: MouseEvent;
  export let menu: [string, () => void][];
  export let destroy: () => void;
  let context: PopupContext | undefined = undefined;

  event.preventDefault();

  function popupDestroy() {
    if (context) {
      context?.destroy();
    }
    destroy();
  }

  function open(e: HTMLElement) {
    const anchor = event.currentTarget as HTMLElement | SVGSVGElement;
    const clickLocation = ViewportCoord.fromEvent(event);
    context = new PopupContext(anchor, e, clickLocation, popupDestroy);
  }

  function doAction(action: () => void) {
    popupDestroy();
    action();
  }
</script>

<div use:open class="menu">
  {#each menu as m}
    <a href="javascript:void(0)" on:click={() => doAction(m[1])}>{m[0]}</a>
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

  .menu a {
    display: block;
    color: black;
    line-height: 1;
  }

  .menu a + a {
    margin-top: 4px;
  }

</style>
