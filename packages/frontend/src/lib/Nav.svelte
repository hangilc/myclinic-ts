<script lang="ts">
  // import { navPage, navTotal, advanceNavPage, gotoNavFirstPage, gotoNavLastPage } from "./ExamVars";

  export let page: number;
  export let total: number;
  export let gotoPage: (page: number) => void;

  function triggerGotoPage(p: number): void {
    if( p !== page ){
      gotoPage(p);
    }
  }

  function gotoFirstPage(): void {
    triggerGotoPage(0);
  }

  function advancePage(n: number): void {
    const p = page + n;
    if( p >= 0 && p < total ){
      triggerGotoPage(p);
    }
  }

  function gotoLastPage(): void {
    if( total > 0 ){
      triggerGotoPage(total - 1);
    } else {
      triggerGotoPage(0);
    }
  }
</script>

{#if total > 1}
<div class="nav">
  <a href="javascript:void(0)" on:click={() => gotoFirstPage()}>最初へ</a>
  <a href="javascript:void(0)" on:click={() => advancePage(-1)}>前へ</a>
  <a href="javascript:void(0)" on:click={() => advancePage(+1)}>次へ</a>
  <a href="javascript:void(0)" on:click={() => gotoLastPage()}>最後へ</a>
  <span class="state">
    (
    <span>{page + 1}</span> /
    <span>{total}</span>
    )
  </span>
</div>
{/if}

<style>
  .state {
    margin-left: 10px;
  }
</style>
