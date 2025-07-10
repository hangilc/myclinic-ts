<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import type {
    RP剤情報Wrapper,
    薬品情報Wrapper,
    用法補足レコードWrapper,
  } from "../denshi-tmpl";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";
  import TrashLink from "../icons/TrashLink.svelte";

  export let group: RP剤情報Wrapper;
  export let isEditing: boolean;
  let inputText = "";
  let inputElement: HTMLInputElement | undefined = undefined;

  updateIsEditing();

  function updateIsEditing() {
    isEditing = group.用法補足レコード.some((r) => r.isEditing);
  }

  function doEdit(record: 用法補足レコードWrapper) {
    record.isEditing = true;
    inputText = record.data.用法補足情報;
    group = group;
    updateIsEditing();
  }

  function doEnter(record: 用法補足レコードWrapper) {
    if (inputText !== "") {
      record.data.用法補足情報 = inputText;
      record.isEditing = false;
      group = group;
      updateIsEditing();
    }
  }

  function doCancel(record: 用法補足レコードWrapper) {
    record.isEditing = false;
    inputText = "";
    group = group;
    updateIsEditing();
  }

  function doDelete(record: 用法補足レコードWrapper) {
    group.用法補足レコード = group.用法補足レコード.filter(
      (r) => r.id !== record.id,
    );
    group = group;
    updateIsEditing();
  }

  function isVisible(group: RP剤情報Wrapper): boolean {
    return group.用法補足レコード.length > 0;
  }
</script>

{#if isVisible(group)}
  <Field>
    <FieldTitle>用法補足</FieldTitle>
    <FieldForm>
      {#each group.用法補足レコード as record (record.id)}
        {#if !record.isEditing}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div on:click={() => doEdit(record)} class="rep">
            {record.data.用法補足情報}
          </div>
        {:else}
          <form
            on:submit|preventDefault={() => doEnter(record)}
            class="with-icons"
          >
            <input
              type="text"
              bind:value={inputText}
              bind:this={inputElement}
            />
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
