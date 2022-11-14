<script lang="ts">
    import { tick } from "svelte";
  import { visits } from "./ExamVars";
  import Record from "./record/Record.svelte";

  let topElement: HTMLElement;

  async function onLast() {
    window.scroll({ top: 0 });
  }
</script>

<div bind:this={topElement}>
  {#each $visits as visit, i (visit.visitId)}
    <Record bind:visit={visit} isLast={i === ($visits.length - 1)} 
      {onLast}/>
  {/each}
</div>