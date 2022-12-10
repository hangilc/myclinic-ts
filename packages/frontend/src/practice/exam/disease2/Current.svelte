<script lang="ts">
  import type { DiseaseData } from "myclinic-model";
  import type { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";
  import { startDateRep } from "./start-date-rep";

  export let env: DiseaseEnv;
  export let doMode: (mode: Mode) => void;
  const list = env.currentList;

  function onDiseaseClick(d: DiseaseData) {
    
  }
</script>

<div>
  {#each list as d (d.disease.diseaseId)}
    <div on:click={() => onDiseaseClick(d)} class="diseaseWrapper">
      <span>{d.fullName}</span>
      <span class="start-date">({startDateRep(d.disease.startDateAsDate)})</span
      >
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
