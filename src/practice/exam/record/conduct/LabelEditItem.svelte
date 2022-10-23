<script lang="ts">
  import type { ConductEx } from "@/lib/model"
  import LabelEdit from "./LabelEdit.svelte";

  export let conduct: ConductEx;
  let mode = "disp";
  let edit: LabelEdit;

  function doLabelClick(): void {
    mode = "edit";
    edit.open();
  }

</script>

{#if mode === "disp"}
<div class="disp" on:click={doLabelClick}>
  {conduct.gazouLabel || "（画像ラベルなし）"}
</div>
{/if}
<LabelEdit conduct={conduct} bind:this={edit} onClose={() => mode = "disp"}/>

<style>
  .disp {
    cursor: pointer;
  }
</style>