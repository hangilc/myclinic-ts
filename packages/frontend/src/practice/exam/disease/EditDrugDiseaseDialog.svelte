<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { DrugDisease } from "@/lib/drug-disease";

  export let destroy: () => void;
  export let item: DrugDisease;
  let drugName = item.drugName;
  let diseaseName = item.diseaseName;
</script>

<Dialog title="薬剤病名の編集" {destroy}>
  <div>
    薬剤名：<input type="text" bind:value={drugName} />
  </div>
  <div>
    傷病名：<input type="text" bind:value={diseaseName} />
  </div>
  <div>
    
  </div>
</Dialog>