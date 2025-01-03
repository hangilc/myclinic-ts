<script lang="ts">
  import type { DiseaseData } from "myclinic-model";
  import { startDateRep } from "./start-date-rep";
  import type { Writable } from "svelte/store";
  import type { DiseaseEnv } from "./disease-env";

  export let env: Writable<DiseaseEnv | undefined>;
  export let onSelect: (d: DiseaseData) => void = (_) => {};

  function onDiseaseClick(d: DiseaseData) {
    onSelect(d);
  }
</script>

<div data-cy="disease-current">
  {#each ($env?.currentList ?? []) as d (d.disease.diseaseId)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:click={() => onDiseaseClick(d)}
      class="diseaseWrapper"
      data-cy="disease-item"
      data-disease-id={d.disease.diseaseId}
    >
      <span data-cy="disease-name">{d.fullName}</span>
      <span class="start-date" data-cy="disease-aux"
        >({startDateRep(d.disease.startDateAsDate)})</span
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
