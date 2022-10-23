<script lang="ts">
  import { navPage, navTotal, advanceNavPage, gotoNavFirstPage, gotoNavLastPage } from "./ExamVars";

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
{#if $navTotal > 1}
<div>
  <a href="javascript:void(0)" on:click={() => gotoNavFirstPage()}>最初へ</a>
  <a href="javascript:void(0)" on:click={() => advanceNavPage(-1)}>前へ</a>
  <a href="javascript:void(0)" on:click={() => advanceNavPage(+1)}>次へ</a>
  <a href="javascript:void(0)" on:click={() => gotoNavLastPage()}>最後へ</a>
  <span>
    <span>{$navPage + 1}</span> /
    <span>{$navTotal}</span>
  </span>
</div>
{/if}
