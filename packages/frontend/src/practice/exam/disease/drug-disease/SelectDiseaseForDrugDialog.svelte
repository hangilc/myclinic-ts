<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { Writable } from "svelte/store";
  import type { DiseaseEnv } from "../disease-env";
  import { DiseaseData, diseaseFullName } from "myclinic-model";
  import type { DrugDisease } from "@/lib/drug-disease";
  import { cache } from "@/lib/cache";
  import api from "@/lib/api";

  export let destroy: () => void;
  export let drugName: string;
  export let env: Writable<DiseaseEnv | undefined>;
  export let onSelected: () => void;
  let drugNameInput = drugName;
  let diseaseNameInput = "";
  let disease: DiseaseData | undefined = undefined;

  function doSelect(selected: DiseaseData) {
    diseaseNameInput = selected.fullName;
    disease = selected;
  }

  async function doEnter() {
    drugNameInput = drugNameInput.trim();
    diseaseNameInput = diseaseNameInput.trim();
    if( drugNameInput && diseaseNameInput && disease ){
      const dd: DrugDisease = {
        drugName: drugNameInput,
        diseaseName: diseaseNameInput,
        fix: {
          pre: disease.adjList.map(item => item[1]).filter(m => m.isPrefix).map(m => m.name),
          name: disease.byoumeiMaster.name,
          post: disease.adjList.map(item => item[1]).filter(m => !m.isPrefix).map(m => m.name),
        }
      };
      const dds = await cache.getDrugDiseases();
      dds.push(dd);
      await api.setDrugDiseases(dds);
      cache.clearDrugDiseases();
      destroy();
      onSelected();
    }
  }
</script>

<Dialog title="病名選択" {destroy}>
  <div>薬剤名：<input type="text" bind:value={drugNameInput} /></div>
  <div>傷病名：<input type="text" bind:value={diseaseNameInput} /></div>
  <div>
    <button on:click={doEnter}>入力</button>
  </div>
  <div>
    {#each $env?.currentList ?? [] as disease (disease.disease.diseaseId)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="disease" on:click={() => doSelect(disease)}>
        {disease.fullName}
      </div>
    {/each}
  </div>
</Dialog>

<style>
  .disease {
    cursor: pointer;
    user-select: none;
  }
</style>
