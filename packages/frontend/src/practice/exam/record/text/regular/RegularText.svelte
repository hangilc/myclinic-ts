<script lang="ts">
  import { formatVisitText } from "@/lib/format-visit-text";
  import type * as m from "myclinic-model"
  import TextForm from "./TextForm.svelte"

  export let text: m.Text;
  export let index: number;
  export let patientId: number;
  let isEditing = false;

  function conv(s: string): string {
    return formatVisitText(s);
  }
</script>

{#if isEditing}
  <TextForm {text} {index} {patientId} onClose={() => isEditing = false} />
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="top" on:click={() => isEditing = true}>
    <div>{@html conv(text.content)}</div>
  </div>
{/if}

<style>
  .top {
    margin-bottom: 10px;
  }
</style>
