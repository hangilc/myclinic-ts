<script lang="ts">
  import type { 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
  import {
    index薬品補足レコード,
    unindex薬品補足レコード,
    type 薬品補足レコードIndexed,
  } from "../denshi-editor-types";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";

  export let 薬品補足レコード: 薬品補足レコード[] | undefined;
  export let isEditing: boolean;

  let records: 薬品補足レコードIndexed[] = (薬品補足レコード?? []).map((r) =>
    index薬品補足レコード(r),
  );

  updateIsEditing();

  function updateIsEditing() {
    for (let r of records) {
      if (r.isEditing) {
        isEditing = true;
        return;
      }
    }
    isEditing = false;
  }

  function doEnter(record: 薬品補足レコードIndexed) {
    if (record.薬品補足情報 === "") {
      alert("薬品補足が空白です。");
      return;
    }
    record.orig薬品補足情報 = record.薬品補足情報;
    record.isEditing = false;
    records = records;
    updateIsEditing();
    if (!isEditing) {
      薬品補足レコード = records.map((r) => unindex薬品補足レコード(r));
    }
  }

  function doDelete(record: 薬品補足レコードIndexed) {
    records = records.filter((r) => r.id !== record.id);
    updateIsEditing();
    if (!isEditing) {
      if (records.length === 0) {
        薬品補足レコード = undefined;
      } else {
        薬品補足レコード = records.map((r) => unindex薬品補足レコード(r));
      }
    }
  }
</script>

{#each records as record (record.id)}
  <div>
    {#if record.isEditing}
      <form on:submit|preventDefault={() => doEnter(record)}>
        薬品補足：<input type="text" bind:value={record.薬品補足情報} />
		{#if record.薬品補足情報.length > 0}
          <SubmitLink onClick={() => doEnter(record)} />
		{/if}
		<TrashLink onClick={() => doDelete(record)} />
      </form>
    {:else}
      薬品補足：{record.薬品補足情報}
      <TrashLink onClick={() => doDelete(record)} style="margin-left:3px;" />
    {/if}
  </div>
{/each}
