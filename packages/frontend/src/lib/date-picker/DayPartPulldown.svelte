<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import SurfacePulldown from "../SurfacePulldown.svelte";
  import SelectItem from "../SelectItem.svelte";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let dayList: number[];
  export let day: number;
  export let onChange: (day: number) => void;

  let selected: Writable<number> = writable(day);

  selected.subscribe(onChange);
</script>

<SurfacePulldown {destroy} {anchor} maxHeight="400px">
  {#each dayList as d}
    <SelectItem data={d} {selected} onSelected={destroy}>{d}</SelectItem>
  {/each}
</SurfacePulldown>