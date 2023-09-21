<script lang="ts">
  import { monthPulldown } from "./month-pulldown";

  export let month: number;
  export let onChange: (month: number) => void;
  // let anchor: HTMLElement;

</script>

<span class="top">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span on:click={monthPulldown(() => month, onChange)}>{month}</span><span>月</span>
    <!-- <MonthPulldown slot="menu" {onChange} {month} {destroy}/> -->
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    min-width: 2.3rem;
    text-align: right;
  }
</style>