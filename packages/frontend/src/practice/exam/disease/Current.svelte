<script lang="ts">
  import type { DiseaseData } from "myclinic-model";
  import { startDateRep } from "./types"

  export let list: DiseaseData[] = [];
  export let onDiseaseClick: (d: DiseaseData) => void = _ => {};

</script>

<div>
  {#each list as d (d.disease.diseaseId)}
  <div on:click={() => onDiseaseClick(d)} class="diseaseWrapper">
    <span>{d.fullName}</span>
    <span class="start-date">({startDateRep(d.disease.startDateAsDate)})</span>
  </div>
  {/each}
</div>

<style>
  .diseaseWrapper {
    cursor: pointer;
  }

  .start-date {
    font-size: 100%;
    color: #666;
  }
</style>
