<script lang="ts">
  import type { ConductKindType, ConductEx, VisitEx } from "myclinic-model";
  import EditWidget from "./EditWidget.svelte";

  export let conduct: ConductEx;
  export let visit: VisitEx;
  let editWidget: EditWidget;

  let mode = "disp";

  function kindRep(kind: ConductKindType): string {
    return kind.rep;
  }

  function doDispClick(): void {
    mode = "edit";
  }
</script>

{#if mode === "disp"}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="disp" on:click={doDispClick}>
    <div>[{kindRep(conduct.kind)}]</div>
    <div>{conduct.gazouLabel || ""}</div>
    {#each conduct.shinryouList as shinryou (shinryou.conductShinryouId)}
      <div>* {shinryou.master.name}</div>
    {/each}
    {#each conduct.drugs as drug (drug.conductDrugId)}
      <div>* {drug.master.name} {drug.amount}{drug.master.unit}</div>
    {/each}
    {#each conduct.kizaiList as kizai (kizai.conductKizaiId)}
      <div>* {kizai.master.name} {kizai.amount}{kizai.master.unit}</div>
    {/each}
  </div>
{:else if mode === "edit"}
  <EditWidget
    {conduct}
    {visit}
    onClose={() => (mode = "disp")}
    bind:this={editWidget}
  />
{/if}

<style>
  .disp {
    cursor: pointer;
  }
</style>
