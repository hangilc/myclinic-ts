<script lang="ts">
  import Popup from "../Popup.svelte";
import MonthPulldown from "./MonthPulldown.svelte";

  export let month: number;
  export let onChange: (month: number) => void;
  let anchor: HTMLElement;

</script>

<span class="top">
  <Popup let:destroy let:trigger>
    <span on:click={trigger}>{month}</span><span>月</span>
    <MonthPulldown slot="menu" {onChange} {month} {destroy}/>
  </Popup>
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    min-width: 2.3rem;
    text-align: right;
  }
</style>