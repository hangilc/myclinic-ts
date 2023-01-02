<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import Popup from "../Popup.svelte";
  import GengouPulldown from "./GengouPulldown.svelte";


  export let gengou: string;
  export let gengouList: string[];
  let anchor: HTMLElement;
  export let onChange: (gengou: string) => void;

  let selected: Writable<string> = writable(gengou);
  selected.subscribe(onChange);

</script>

<span class="top" bind:this={anchor}>
  <Popup let:destroy let:trigger>
    <span on:click={trigger}>{gengou}</span>
    <GengouPulldown slot="menu" {destroy} {selected} {gengouList}/>
  </Popup>
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
  }
</style>