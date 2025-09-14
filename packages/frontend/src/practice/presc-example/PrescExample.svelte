<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrugPrefabForm from "@/lib/drug-prefab-dialog/DrugPrefabForm.svelte";
  
  export let isVisible: boolean;
  export let close: () => void;
</script>

{#if isVisible}
  <ServiceHeader title="処方例管理" />
  <DrugPrefabForm destroy={close} />
{/if}
