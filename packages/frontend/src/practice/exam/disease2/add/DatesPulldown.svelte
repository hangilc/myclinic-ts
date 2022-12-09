<script lang="ts">
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import { writable, type Writable } from "svelte/store";
  import * as kanjidate from "kanjidate";
  import SelectItem from "@/lib/SelectItem.svelte";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let dates: Date[];
  export let onSelect: (d: Date) => void;
  let selected: Writable<Date | null> = writable(null); 

  selected.subscribe((d) => {
    if( d != null ){
      destroy();
      onSelect(d);
    }
  })
</script>

<SurfacePulldown {destroy} {anchor}>
  {#each dates as date}
    <SelectItem {selected} data={date}>
      <div>{kanjidate.format(kanjidate.f1, date)}</div>
    </SelectItem>
  {/each}
</SurfacePulldown>