<script lang="ts">
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import Dialog from "@/lib/Dialog.svelte";
  import type { DrugDisease } from "@/lib/drug-disease";

  export let destroy: () => void;
  export let drugName: string;
  export let onRegistered: () => void;
  let diseaseName: string = "";

  async function doRegister() {
    if( drugName !== "" && diseaseName !== "" ){
      const dd: DrugDisease = {
        drugName,
        diseaseName,
      };
      const drugDiseases = await cache.getDrugDiseases();
      drugDiseases.push(dd);
      await api.setDrugDiseaes(drugDiseases);
      cache.clearDrugDiseases();
      destroy();
      onRegistered();
    }
  }
</script>

<Dialog title="病名登録" {destroy}>
  <div>
    薬剤名：<input type="text" bind:value={drugName}/>
  </div>
  <div>
    傷病名：<input type="text" bind:value={diseaseName} />
  </div>
  <div>
    <button on:click={doRegister}>登録</button>
  </div>
</Dialog>