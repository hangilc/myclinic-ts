<script lang="ts">
  import CheckCircle from "@/icons/CheckCircle.svelte";
  import Trash from "@/icons/Trash.svelte";
  import XCircle from "@/icons/XCircle.svelte";
  import type { 備考レコード } from "@/lib/denshi-shohou/presc-info";
  import { onMount } from "svelte";

  export let records: 備考レコード[];
  export let onCancel: () => void;
  export let onDone: (records: 備考レコード[]) => void;

  let text = "";
  let inputElement: HTMLInputElement;

  onMount(() => {
    inputElement?.focus();
  });

  function doAdd() {
    let t = text.trim();
    if (t !== "") {
      let newRecords = [...records, { 備考: t }];
      onDone(newRecords);
    }
  }

  function doDelete(r: 備考レコード) {
    let newRecords = records.filter(rec => rec !== r);
    onDone(newRecords);
  }
</script>

<div>
  <div style="font-weight:bold;">備考</div>
  <div>
    {#each records as record}
      <div>
        {record.備考}
        <a href="javascript:void(0)" on:click={() => doDelete(record)}
          style="position:relative;top:3px;"
          ><Trash color="gray" /></a
        >
      </div>
    {/each}
  </div>
  <div style="margin-top:6px;">
    <input type="text" bind:value={text} bind:this={inputElement} />
    <a
      href="javascript:void(0)"
      style="position:relative;top:3px;"
      on:click={doAdd}
    >
      <CheckCircle color="blue" />
    </a>
    <a
      href="javascript:void(0)"
      style="position:relative;top:3px;"
      on:click={onCancel}
    >
      <XCircle color="gray" />
    </a>
  </div>
</div>
