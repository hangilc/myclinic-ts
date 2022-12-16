<script lang="ts">
  import MonthPulldown from "./MonthPulldown.svelte";

  export let month: number;
  export let onChange: (month: number) => void;
  let anchor: HTMLElement;

  function onClick(): void {
    const d: MonthPulldown = new MonthPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        month,
        anchor,
        onChange,
      }
    })
  }
</script>

<span class="top">
  <span on:click={onClick} bind:this={anchor}>{month}</span><span>月</span>
</span>

<style>
  .top {
    user-select: none;
    cursor: pointer;
    min-width: 2.3rem;
    text-align: right;
  }
</style>