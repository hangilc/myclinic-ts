<script lang="ts">
  import type { Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";

  export let destroy: () => void;
  export let gengouList: string[] = ["昭和", "平成", "令和"];
  export let selected: Writable<string>;
</script>

<div>
  {#each gengouList as gengou}
    <SelectItem data={gengou} {selected} onSelected={destroy}
      >{gengou}</SelectItem
    >
  {/each}
</div>
