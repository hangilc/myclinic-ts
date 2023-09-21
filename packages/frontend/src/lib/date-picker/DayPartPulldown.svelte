<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";
  import { PopupContext } from "../popup-context";
  import { ViewportCoord } from "../viewport-coord";

  export let destroy: () => void;
  export let dayList: number[];
  export let day: number;
  export let onChange: (day: number) => void;
  export let event: MouseEvent;
  let selected: Writable<number> = writable(day);
  let context: PopupContext | undefined = undefined;

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

  selected.subscribe(onChange);
</script>

<div class="top menu" use:open>
  {#each dayList as d}
    <SelectItem data={d} {selected} onSelected={popupDestroy}>{d}</SelectItem>
  {/each}
</div>

<style>
  .top {
    max-height: 10rem;
    overflow-y: auto;
    padding-right: 10px;
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
