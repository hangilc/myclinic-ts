<script lang="ts">
  import { visits, scrollToVisitsTop, clearScrollToVisitsTop } from "./exam-vars";
  import Record from "./record/Record.svelte";

  async function onLast() {
    if( scrollToVisitsTop ){
      window.scroll({ top: 0 });
      clearScrollToVisitsTop();
    }
  }
</script>

<div>
  {#each $visits as visit, i (visit.visitId)}
    <Record visit={visit} isLast={i === ($visits.length - 1)} 
      {onLast}/>
  {/each}
</div>