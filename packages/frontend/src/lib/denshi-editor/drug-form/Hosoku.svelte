<script lang="ts">
  import {
    type 薬品補足レコードIndexed,
  } from "../denshi-editor-types";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";

  export let 薬品補足レコード: 薬品補足レコードIndexed[] | undefined;

  function doEnter(record: 薬品補足レコードIndexed) {
    if (record.薬品補足情報 === "") {
      alert("薬品補足が空白です。");
      return;
    }
    record.orig薬品補足情報 = record.薬品補足情報;
    record.isEditing = false;
	薬品補足レコード = 薬品補足レコード;
  }

  function doDelete(record: 薬品補足レコードIndexed) {
	if( 薬品補足レコード){
      薬品補足レコード = 薬品補足レコード.filter((r) => r.id !== record.id);
	}
  }
</script>

{#each (薬品補足レコード?? []) as record (record.id)}
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
