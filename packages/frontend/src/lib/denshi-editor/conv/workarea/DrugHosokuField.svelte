<script lang="ts">
  import { type 薬品補足レコードIndexed } from "../../denshi-editor-types";
  import CancelLink from "../../icons/CancelLink.svelte";
  import SubmitLink from "../../icons/SubmitLink.svelte";
  import TrashLink from "../../icons/TrashLink.svelte";
  import Field from "./Field.svelte";
  import FieldForm from "./FieldForm.svelte";
  import FieldTitle from "./FieldTitle.svelte";

  export let 薬品補足レコード: 薬品補足レコードIndexed[];
  export let visible = true;

  function initElement(e: HTMLInputElement) {
    e.focus();
  }

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
    薬品補足レコード = 薬品補足レコード.filter((r) => r.id !== record.id);
  }

  function doCancel(record: 薬品補足レコードIndexed) {
    record.薬品補足情報 = record.orig薬品補足情報;
    record.isEditing = false;
    薬品補足レコード = 薬品補足レコード;
  }

  function doEdit(record: 薬品補足レコードIndexed) {
    record.isEditing = true;
    薬品補足レコード = 薬品補足レコード;
  }
</script>

<Field {visible}>
  <FieldTitle>薬品補足</FieldTitle>
  <FieldForm>
    {#each 薬品補足レコード as record (record.id)}
      <div>
        {#if record.isEditing}
          <form
            on:submit|preventDefault={() => doEnter(record)}
            class="with-icons"
          >
            <input
              type="text"
              bind:value={record.薬品補足情報}
              use:initElement
            />
            {#if record.薬品補足情報.length > 0}
              <SubmitLink onClick={() => doEnter(record)} />
            {/if}
            {#if record.orig薬品補足情報.length > 0}
              <CancelLink onClick={() => doCancel(record)} />
            {/if}
            <TrashLink onClick={() => doDelete(record)} />
          </form>
        {:else}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <span on:click={() => doEdit(record)} class="cursor-pointer"
            >{record.薬品補足情報}</span
          >
          <TrashLink
            onClick={() => doDelete(record)}
            style="margin-left:3px;"
          />
        {/if}
      </div>
    {/each}
  </FieldForm>
</Field>

<style>
  form {
    margin: 4px 0;
  }
</style>
