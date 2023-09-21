<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";
  import { PopupContext } from "../popup-context";
  import { ViewportCoord } from "../viewport-coord";

  export let destroy: () => void;
  export let nenList: number[];
  export let nen: number;
  export let onChange: (nen: number) => void;
  export let event: MouseEvent;
  let selected: Writable<number> = writable(nen);
  let context: PopupContext | undefined = undefined;

  selected.subscribe(onChange);
  event.preventDefault();

  function popupDestroy() {
    if (context) {
      context?.destroy();
    }
    destroy();
  }

  function open(e: HTMLElement) {
    const anchor = (event.currentTarget || event.target) as
      | HTMLElement
      | SVGSVGElement;
    const clickLocation = ViewportCoord.fromEvent(event);
    context = new PopupContext(anchor, e, clickLocation, popupDestroy);
  }
</script>

<div class="top menu" use:open>
  {#each nenList as n}
    <SelectItem data={n} {selected} onSelected={popupDestroy}>{n}</SelectItem>
  {/each}
</div>

<style>
  .top {
    max-height: 400px;
    padding-right: 10px;
    overflow-y: auto;
  }

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
