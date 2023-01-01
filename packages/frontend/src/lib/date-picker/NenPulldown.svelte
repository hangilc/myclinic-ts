<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";

  export let destroy: () => void;
  export let nenList: number[];
  export let nen: number;
  export let onChange: (nen: number) => void;
  let selected: Writable<number> = writable(nen);

  selected.subscribe(onChange);
</script>

<div class="top">
  {#each nenList as n}
    <SelectItem data={n} {selected} onSelected={destroy}>{n}</SelectItem>
  {/each}
</div>

<style>
  .top {
    max-height: 400px;
    padding-right: 10px;
    overflow-y: auto;
  }
</style>
