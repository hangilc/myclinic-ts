<script type="ts">
  import type { Writable } from "svelte/store";

  type T = $$Generic;
  export let selected: Writable<T | null>;
  export let data: T;
  export let eqData: (a: T, b: T) => boolean = (a, b) => a === b;
  export let onSelected: () => void = () => {};
  export let cursor: string = "default";
  export let dataCy: string = "";
  export let autoIntoView: boolean = false;
  let element: HTMLElement;

  if (autoIntoView) {
    selected.subscribe((sel) => {
      if (sel && eqData(sel, data) && element && element.parentElement) {
        const c = element.parentElement.getBoundingClientRect();
        const r = element.getBoundingClientRect();
        if( r.top < c.top ){
          element.scrollIntoView(true);
        } else if( r.bottom > c.bottom ){
          element.scrollIntoView(false);
        }
      }
    });
  }

  function onClick() {
    selected.set(data);
    onSelected();
  }
</script>

<div
  class="select-item"
  class:selected={$selected === data}
  on:click={onClick}
  style:cursor
  data-cy={dataCy}
  bind:this={element}
>
  <slot />
</div>

<style>
  .select-item:hover {
    background-color: #eee;
  }

  .select-item.selected {
    background-color: #ccc;
  }
</style>
