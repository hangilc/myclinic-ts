<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import type {
    RP剤情報Edit,
    用法補足レコードEdit,
  } from "../denshi-edit";
  import UsageSupplForm from "./UsageSupplForm.svelte";

  export let group: RP剤情報Edit;
  export let onFieldChange: () => void;

  function doEdit(record: 用法補足レコードEdit) {
    record.isEditing用法補足情報 = true;
    group = group;
  }

  function doEnter(record: 用法補足レコードEdit) {
      record.isEditing用法補足情報 = false;
      group = group;
      onFieldChange();
  }

  function doCancel(record: 用法補足レコードEdit) {
    record.isEditing用法補足情報 = false;
    group = group;
  }

  function doDelete(record: 用法補足レコードEdit) {
    group.用法補足レコード = group.用法補足レコードAsList().filter(
      (r) => r.id !== record.id,
    );
    group = group;
    onFieldChange();
  }

  function isVisible(group: RP剤情報Edit): boolean {
    return group.用法補足レコードAsList().length > 0;
  }
</script>

{#if isVisible(group)}
  <Field>
    <FieldTitle>用法補足</FieldTitle>
    <FieldForm>
      {#each group.用法補足レコードAsList() as record (record.id)}
        {#if !record.isEditing用法補足情報}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div on:click={() => doEdit(record)} class="rep">
            {record.用法補足情報}
          </div>
        {:else}
          <UsageSupplForm
            suppl={record}
            onEnter={() => doEnter(record)}
            onCancel={() => doCancel(record)}
            onDelete={() => doDelete(record)}
          />
        {/if}
      {/each}
    </FieldForm>
  </Field>
{/if}

<style>
  .rep {
    cursor: pointer;
  }
</style>
