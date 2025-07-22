<script lang="ts">
  import Link from "../workarea/Link.svelte";

    export let totalItems: number;
    export let onChange: (page: number) => void;
    export let currentPage: number;
    export let itemsPerPage: number;
    let totalPages = 0;

    $: totalPages = calcTotalPages(totalItems);
    
    function calcTotalPages(total: number): number {
      return Math.floor((total - itemsPerPage + 1)/itemsPerPage);
    }

    function gotoPage(page: number): void {
      if( page !== currentPage && page >= 0 && page < totalPages ){
        onChange(page);
        currentPage = page;
      }
    }

    function gotoFirst() {
      gotoPage(0);
    }

    function gotoPrev() {
      gotoPage(currentPage - 1);
    }

    function gotoNext() {
      gotoPage(currentPage + 1);
    }

    function gotoLast() {
      gotoPage(totalPages - 1);
    }
</script>
{#if totalPages >= 2}
  <Link onClick={gotoFirst}>最初へ</Link>
  <Link onClick={gotoPrev}>前へ</Link>
  {currentPage + 1}/{totalPages}
  <Link onClick={gotoNext}>次へ</Link>
  <Link onClick={gotoLast}>最後へ</Link>
{/if}