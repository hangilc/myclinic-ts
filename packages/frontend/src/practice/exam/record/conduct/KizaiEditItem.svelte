<script lang="ts">
  import type { ConductKizaiEx } from "myclinic-model"
  import KizaiEdit from "./KizaiEdit.svelte"

  let mode = "disp";

  export let conductKizai: ConductKizaiEx;

  function doDispClick(): void {
    mode = "edit";
  }
</script>

{#if mode === "disp"}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="disp" on:click={doDispClick}>
  * {conductKizai.master.name}{conductKizai.amount}{conductKizai.master.unit}
</div>
{:else if mode === "edit"}
<KizaiEdit conductKizai={conductKizai} onClose={() => mode = "disp"}/>
{/if}

<style>
  .disp {
    cursor: pointer;
  }
</style>
