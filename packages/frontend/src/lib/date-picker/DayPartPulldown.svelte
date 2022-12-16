<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import SurfacePulldown from "../SurfacePulldown.svelte";
  import SelectItem from "../SelectItem.svelte";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let dayList: number[];
  export let day: number;
  let selected: Writable<number> = writable(day);

</script>

<SurfacePulldown {destroy} {anchor} maxHeight="400px">
  {#each dayList as d}
    <SelectItem data={d} {selected}>{d}</SelectItem>
  {/each}
</SurfacePulldown>