<script lang="ts">
  import type * as m from "@/lib/model"
  import TextForm from "./TextForm.svelte"

  export let text: m.Text;
  export let index: number;
  let isEditing = false;

  function conv(s: string): string {
    return s.replaceAll("\n", "<br />\n");
  }
</script>

{#if isEditing}
  <TextForm text={text} index={index} onClose={() => isEditing = false} />
{:else}
  <div class="top" on:click={() => isEditing = true}>
    <div>{@html conv(text.content)}</div>
  </div>
{/if}

<style>
  .top {
    margin-bottom: 10px;
  }
</style>