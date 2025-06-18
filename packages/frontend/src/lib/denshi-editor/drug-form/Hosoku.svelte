<script lang="ts">
  import type { 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
  import {
    index薬品補足レコード,
    type 薬品補足レコードIndexed,
  } from "../denshi-editor-types";

  export let 薬品補足レコード: 薬品補足レコード[];
  export let editingIndex: number[];

  let records: 薬品補足レコードIndexed[] = 薬品補足レコード.map((r) =>
    index薬品補足レコード(r),
  );

  let editingIds: number[] = editingIndex.map((index) => records[index].id);

  function doEnter() {}

</script>

{#each records as record (record.id)}
  <div>
    {#if editingIds.includes(record.id)}
      <form on:submit|preventDefault={doEnter}>
        薬品補足：<input type="text" bind:value={record.薬品補足情報} />
      </form>
    {:else}
      薬品補足：{record.薬品補足情報}
    {/if}
  </div>
{/each}
