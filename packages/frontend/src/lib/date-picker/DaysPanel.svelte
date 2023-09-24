<script lang="ts">
  import type { DateItem } from "./date-item";

  export let items: DateItem[];
  export let onChange: (date: Date) => void;

  function doClick(d: Date): void {
    onChange(d);
  }
</script>

<div class="days-panel">
  <span class="sunday">日</span>
  <span>月</span>
  <span>火</span>
  <span>水</span>
  <span>木</span>
  <span>金</span>
  <span>土</span>
  {#each items as di (di.date)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class={di.kind} class:selected={di.isCurrent} on:click={() => doClick(di.date)}>
      {di.date.getDate()}
    </span>
  {/each}
</div>

<style>
  .days-panel {
    display: grid;
    grid-template-columns: repeat(7, 1.5em);
    margin-top: 4px;
  }

  .days-panel span {
    text-align: right;
    cursor: pointer;
    user-select: none;
  }

  .days-panel span.selected {
    background-color: #ccc;
  }

  .days-panel span.pre,
  .days-panel span.post {
    color: #999;
  }

  .sunday {
    color: red;
  }
</style>
