<script lang="ts">
  import type { DiseaseData } from "myclinic-model";
  import { startDateRep } from "./start-date-rep";
  import type { Writable } from "svelte/store";
  import type { DiseaseEnv } from "./disease-env";
    import DiseaseRep from "./DiseaseRep.svelte";

  export let env: Writable<DiseaseEnv | undefined>;
  export let onSelect: (d: DiseaseData) => void = (_) => {};

  function onDiseaseClick(d: DiseaseData) {
    onSelect(d);
  }
</script>

<div data-cy="disease-current">
  {#each ($env?.currentList ?? []) as d (d.disease.diseaseId)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => onDiseaseClick(d)}
      class="diseaseWrapper"
      data-cy="disease-item"
      data-disease-id={d.disease.diseaseId}
    ><DiseaseRep disease={d} env={$env}/>
    </div>
  {/each}
</div>

<style>
  .diseaseWrapper {
    cursor: pointer;
  }
</style>
