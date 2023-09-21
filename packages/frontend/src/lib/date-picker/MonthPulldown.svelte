<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";
  import { PopupContext } from "../popup-context";
  import { ViewportCoord } from "../viewport-coord";

  export let destroy: () => void;
  export let month: number;
  export let onChange: (month: number) => void;
  export let event: MouseEvent;
  let monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let selected: Writable<number> = writable(month);
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

<div class="menu" use:open>
  {#each monthList as m}
    <SelectItem data={m} {selected} onSelected={popupDestroy}>{m}</SelectItem>
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
