<script lang="ts">
  import type { Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";
  import SurfacePulldown from "../SurfacePulldown.svelte";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let selected: Writable<string>;
</script>

<SurfacePulldown {destroy} {anchor}>
  <svelte:fragment>
    {#each gengouList as gengou}
      <SelectItem data={gengou} {selected} onSelected={destroy}>{gengou}</SelectItem>
    {/each}
  </svelte:fragment>
</SurfacePulldown>
