<script lang="ts">
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let drugName: string;
  export let diseaseName: string;
  export let pre: string[];
  export let post: string[];
  export let onRegistered: () => void;
  let shortDrugName = drugName;
  let shortDiseaseName = diseaseName;

  async function doRegister() {
    const drugDiseases = await cache.getDrugDiseases();
    drugDiseases.push({ drugName, diseaseName, fix: {
      pre, name: diseaseName, post
    }});
    await api.setDrugDiseases(drugDiseases);
    cache.clearDrugDiseases();
    destroy();
    onRegistered();
  }
</script>

<Dialog title="薬剤病名登録" {destroy}>
  <input type="text" bind:value={shortDrugName} />
  <input type="text" bind:value={shortDiseaseName} />
  <button on:click={doRegister}>登録</button>
</Dialog>