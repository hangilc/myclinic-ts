<script lang="ts">
  import type { DiseaseData } from "./types";
  import { fullName, getEndReason, startDateRep } from "./types";

  export let list: DiseaseData[];

  function formatAux(data: DiseaseData): string {
    const reason = getEndReason(data);
    const start = startDateRep(data);
    const sep = " - ";
    let end: string;
    return `${reason.label}、${start}`;
  }
</script>

<div class="list">
  {#each list as data}
  <div>
    <span>{fullName(data)}</span>
  </div>
  {/each}
</div>

<style>
  .list {
    max-height: 10em;
    overflow-y: auto;
  }
</style>
