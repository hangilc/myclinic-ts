<script lang="ts">
  import type { Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";
  import { PopupContext } from "../popup-context";
  import { ViewportCoord } from "../viewport-coord";

  export let destroy: () => void;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let selected: Writable<string>;
  export let event: MouseEvent;
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
  }

</script>

<div class="menu" use:open>
  {#each gengouList as gengou}
    <SelectItem data={gengou} {selected} onSelected={popupDestroy}
      >{gengou}</SelectItem
    >
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
</style>

