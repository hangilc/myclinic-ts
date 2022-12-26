<script lang="ts">
  import SelectItem from "@/lib/SelectItem.svelte";
import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import type { ScannerDevice } from "myclinic-model/model";
  import type { Writable } from "svelte/store";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let list: ScannerDevice[];
  export let selected: Writable<ScannerDevice | undefined>;
</script>

<SurfacePulldown {destroy} {anchor}>
  {#each list as d}
    <SelectItem data={d} {selected}>{d.description}</SelectItem>
  {/each}
</SurfacePulldown>