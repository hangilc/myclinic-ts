<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import type {
    薬品情報Wrapper,
    薬品補足レコードWrapper,
  } from "../denshi-tmpl";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";

  export let drug: 薬品情報Wrapper;
  export let isEditing: boolean;
  export let onFieldChange: () => void;
  let inputText = "";
  let inputElement: HTMLInputElement | undefined = undefined;

  updateIsEditing();

  function updateIsEditing() {
    isEditing = drug.薬品補足レコード.some((r) => r.isEditing);
  }

  function doEdit(record: 薬品補足レコードWrapper) {
    record.isEditing = true;
    inputText = record.data.薬品補足情報;
    drug = drug;
    updateIsEditing();
  }

  function doEnter(record: 薬品補足レコードWrapper) {
    if( inputText !== "" ){
      record.data.薬品補足情報 = inputText;
      record.isEditing = false;
      drug = drug;
      updateIsEditing();
      onFieldChange();
    }
  }

  function doCancel(record: 薬品補足レコードWrapper) {
    record.isEditing = false;
    inputText = "";
    drug = drug;
    updateIsEditing();
  }

  function doDelete(record: 薬品補足レコードWrapper) {
    drug.薬品補足レコード = drug.薬品補足レコード.filter(
      (r) => r.id !== record.id,
    );
    drug = drug;
    updateIsEditing();
    onFieldChange();
  }

  function isVisible(drug: 薬品情報Wrapper): boolean {
    return drug.薬品補足レコード.length > 0;
  }
</script>

{#if isVisible(drug)}
<Field>
  <FieldTitle>薬品補足</FieldTitle>
  <FieldForm>
    {#each drug.薬品補足レコード as record (record.id)}
      {#if !record.isEditing}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click={() => doEdit(record)} class="rep">
          {record.data.薬品補足情報}
        </div>
      {:else}
        <form
          on:submit|preventDefault={() => doEnter(record)}
          class="with-icons"
        >
          <input type="text" bind:value={inputText} bind:this={inputElement} />
          <SubmitLink onClick={() => doEnter(record)} />
          <CancelLink onClick={() => doCancel(record)} />
          <TrashLink onClick={() => doDelete(record)} />
        </form>
      {/if}
    {/each}
  </FieldForm>
</Field>
{/if}

<style>
  .rep {
    cursor: pointer;
  }

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }
</style>
