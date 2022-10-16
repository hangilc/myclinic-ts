<script lang="ts">
  import { visits } from "./ExamVars";
  import Record from "./record/Record.svelte";
</script>

<div>
  {#each $visits as visit (visit.visitId)}
    <Record bind:visit={visit} />
  {/each}
</div>