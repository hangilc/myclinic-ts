<script lang="ts">
  import { visits, scrollToVisitsTop, clearScrollToVisitsTop } from "./ExamVars";
  import Record from "./record/Record.svelte";

  let topElement: HTMLElement;

  async function onLast() {
    if( scrollToVisitsTop ){
      window.scroll({ top: 0 });
      clearScrollToVisitsTop();
    }
  }
</script>

<div bind:this={topElement}>
  {#each $visits as visit, i (visit.visitId)}
    <Record bind:visit={visit} isLast={i === ($visits.length - 1)} 
      {onLast}/>
  {/each}
</div>