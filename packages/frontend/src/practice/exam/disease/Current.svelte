<script lang="ts">
  import type { DiseaseData } from "myclinic-model";
  import { startDateRep } from "./types"

  export let list: DiseaseData[];

</script>

<div>
  {#each list as d (d.disease.diseaseId)}
  <div>
    <span>{d.fullName}</span>
    <span class="start-date">({startDateRep(d.disease.startDateAsDate)})</span>
  </div>
  {/each}
</div>

<style>
  .start-date {
    font-size: 100%;
    color: #666;
  }
</style>
