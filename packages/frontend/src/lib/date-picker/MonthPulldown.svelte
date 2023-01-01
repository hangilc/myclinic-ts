<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "../SelectItem.svelte";

  export let destroy: () => void;
  export let month: number;
  export let onChange: (month: number) => void;
  let monthList = [1,2,3,4,5,6,7,8,9,10,11,12];
  let selected: Writable<number> = writable(month);

  selected.subscribe(onChange);
</script>

<div>
  {#each monthList as m}
    <SelectItem data={m} {selected} onSelected={destroy}>{m}</SelectItem>
  {/each}
</div>