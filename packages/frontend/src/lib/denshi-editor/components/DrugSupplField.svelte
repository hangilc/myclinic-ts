<script lang="ts">
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import type {
    薬品情報Edit,
    薬品補足レコードEdit,
  } from "../denshi-edit";
  import DrugSupplForm from "./DrugSupplForm.svelte";

  export let drug: 薬品情報Edit;
  export let onFieldChange: () => void;

  function doEdit(record: 薬品補足レコードEdit) {
    record.isEditing = true;
    drug = drug;
  }

  function doEnter(record: 薬品補足レコードEdit) {
    record.isEditing = false;
    drug = drug;
    onFieldChange();
  }

  function doCancel(record: 薬品補足レコードEdit) {
    record.isEditing = false;
    drug = drug;
  }

  function doDelete(record: 薬品補足レコードEdit) {
    drug.薬品補足レコード = drug.薬品補足レコードAsList().filter(
      (r) => r.id !== record.id,
    );
    drug = drug;
    onFieldChange();
  }

  function isVisible(drug: 薬品情報Edit): boolean {
    return drug.薬品補足レコードAsList().length > 0;
  }
</script>

{#if isVisible(drug)}
  <Field>
    <FieldTitle>薬品補足</FieldTitle>
    <FieldForm>
      {#each drug.薬品補足レコードAsList() as record (record.id)}
        {#if !record.isEditing}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div on:click={() => doEdit(record)} class="rep">
            {record.薬品補足情報 || "（空白）"}
          </div>
        {:else}
          <DrugSupplForm
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
