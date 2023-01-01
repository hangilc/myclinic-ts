<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";

  export let destroy: () => void;
  export let dayList: number[];
  export let day: number;
  export let onChange: (day: number) => void;

  let selected: Writable<number> = writable(day);

  selected.subscribe(onChange);
</script>

<div class="top">
  {#each dayList as d}
    <SelectItem data={d} {selected} onSelected={destroy}>{d}</SelectItem>
  {/each}
</div>

<style>
  .top {
    max-height: 10rem;
    overflow-y: auto;
    padding-right: 10px;
  }
</style>