<script lang="ts">
  import { currentPatient, currentVisitId, visits } from "./ExamVars";
  import Record from "./record/Record.svelte";
  // import type * as m from "../../lib/model";
  // import api from "../../lib/api";

</script>

<div>
  {#each $visits as visit (visit.visitId)}
    <Record visit={visit} />
  {/each}
</div>