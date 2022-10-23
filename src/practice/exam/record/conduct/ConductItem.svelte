<script lang="ts">
  import {
    ConductKindObject,
    type ConductEx,
    type ConductKindTag,
    type VisitEx,
  } from "@/lib/model";
  import EditWidget from "./EditWidget.svelte";

  export let conduct: ConductEx;
  export let visit: VisitEx;
  let editWidget: EditWidget;

  let mode = "disp";

  $: console.log("conduct changed (conduct-item)", conduct);

  function kindRep(kindTag: ConductKindTag): string {
    return ConductKindObject.fromTag(kindTag).rep;
  }

  function doDispClick(): void {
    mode = "edit";
    editWidget.open();
  }

</script>

{#if mode === "disp"}
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
{/if}
<EditWidget conduct={conduct} visit={visit} onClose={() => mode = "disp"} bind:this={editWidget} />

<style>
  .disp {
    cursor: pointer;
  }
</style>
