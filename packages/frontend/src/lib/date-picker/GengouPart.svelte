<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import { gengouPulldown } from "./gengou-pulldown";


  export let gengou: string;
  export let gengouList: string[];
  export let onChange: (gengou: string) => void;

  let selected: Writable<string> = writable(gengou);
  selected.subscribe(onChange);

</script>

<span class="top">
    <!-- svelte-ignore missing-declaration -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span on:click={gengouPulldown(selected, { gengouList })}>{gengou}</span>
    <!-- <GengouPulldown slot="menu" {destroy} {selected} {gengouList}/> -->
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
  }
</style>