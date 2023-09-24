<script lang="ts">
  import type { ConductKindType, ConductEx } from "myclinic-model";
  import KindEdit from "./KindEdit.svelte"

  export let conduct: ConductEx;
  let mode = "disp"
  let edit: KindEdit

  function kindRep(kind: ConductKindType): string {
    return kind.rep;
  }

  function doDispClick(): void {
    mode = "edit";
    edit.open();
  }

</script>

{#if mode === "disp"}
<!-- svelte-ignore a11y-no-static-element-interactions -->
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