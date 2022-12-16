<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import { pad } from "../pad";
  import SelectItem from "../SelectItem.svelte";
  import SurfacePulldown from "../SurfacePulldown.svelte";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let nenList: number[];
  export let nen: number;
  export let onChange: (nen: number) => void;
  let selected: Writable<number> = writable(nen);

  selected.subscribe(onChange);
</script>

<SurfacePulldown {destroy} {anchor}>
  <svelte:fragment>
    {#each nenList as n}
      <SelectItem data={n} {selected} onSelected={destroy}>{n}</SelectItem>
    {/each}
  </svelte:fragment>
</SurfacePulldown>
