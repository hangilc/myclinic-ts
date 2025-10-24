<script lang="ts">
  import { formatVisitText } from "@/lib/format-visit-text";
  import type * as m from "myclinic-model";
  import TextForm from "./TextForm.svelte";
  import {
    isShohouPrintPending,
    shohouPrintChanged,
  } from "@/practice/exam/shohou-print-watcher";
  import { onDestroy } from "svelte";

  export let text: m.Text;
  export let index: number;
  export let patientId: number;
  let isEditing = false;
  let isPrintPending = isShohouPrintPending(text.textId);

  let unsubs = [
    shohouPrintChanged.subscribe((id) => {
      if (id <= 0) {
        return;
      }
      isPrintPending = isShohouPrintPending(text.textId);
    }),
  ];

  onDestroy(() => unsubs.forEach(f => f()));

  function conv(s: string): string {
    return formatVisitText(s);
  }
</script>

{#if isEditing}
  <TextForm {text} {index} {patientId} onClose={() => (isEditing = false)} />
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={() => (isEditing = true)}>
    <div>{@html conv(text.content)}</div>
    {#if isPrintPending}<div class="print-pending">未印刷</div>{/if}
  </div>
{/if}

<style>
  .top {
    margin-bottom: 10px;
  }

  .print-pending {
    color: red;
  }
</style>
