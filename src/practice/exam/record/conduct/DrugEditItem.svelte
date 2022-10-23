<script lang="ts">
  import type { ConductDrugEx } from "@/lib/model"
  import DrugEdit from "./DrugEdit.svelte"

  let mode = "disp";

  export let conductDrug: ConductDrugEx;

  function doDispClick(): void {
    mode = "edit";
  }
</script>

{#if mode === "disp"}
<div class="disp" on:click={doDispClick}>
  * {conductDrug.master.name}{conductDrug.amount}{conductDrug.master.unit}
</div>
{:else if mode === "edit"}
<DrugEdit conductDrug={conductDrug} onClose={() => mode = "disp"}/>
{/if}

<style>
  .disp {
    cursor: pointer;
  }
</style>
