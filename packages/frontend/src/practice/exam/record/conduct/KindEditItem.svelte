<script lang="ts">
  import { ConductKindObject, type ConductEx, type ConductKindTag } from "myclinic-model";
  import KindEdit from "./KindEdit.svelte"

  export let conduct: ConductEx;
  let mode = "disp"
  let edit: KindEdit

  function kindRep(kindTag: ConductKindTag): string {
    return ConductKindObject.fromTag(kindTag).rep;
  }

  function doDispClick(): void {
    mode = "edit";
    edit.open();
  }

</script>

{#if mode === "disp"}
<div class="disp" on:click={doDispClick}>
  [{kindRep(conduct.kind)}]
</div>
{/if}
<KindEdit conduct={conduct} onClose={() => mode = "disp"} bind:this={edit} />

<style>
  .disp {
    cursor: pointer;
  }
</style>