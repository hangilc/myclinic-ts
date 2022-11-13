<script lang="ts">
  import type { ConductShinryouEx } from "@/lib/model"
  import ShinryouEdit from "./ShinryouEdit.svelte"

  let mode = "disp";

  export let conductShinryou: ConductShinryouEx;

  function doDispClick(): void {
    mode = "edit";
  }
</script>

{#if mode === "disp"}
<div class="disp" on:click={doDispClick}>* {conductShinryou.master.name}</div>
{:else if mode === "edit"}
<ShinryouEdit conductShinryou={conductShinryou} onClose={() => mode = "disp"}/>
{/if}

<style>
  .disp {
    cursor: pointer;
  }
</style>