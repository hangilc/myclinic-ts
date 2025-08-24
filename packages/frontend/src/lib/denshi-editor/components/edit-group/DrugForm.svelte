<script lang="ts">
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import type { 薬品情報Edit } from "../../denshi-edit";
  import type { KouhiSet } from "../../kouhi-set";
  import DrugAmountField from "../DrugAmountField.svelte";
  import DrugNameField from "../DrugNameField.svelte";
  import DrugSupplField from "../DrugSupplField.svelte";
  import JohoKubunField from "../JohoKubunField.svelte";
  import KouhiField from "../KouhiField.svelte";
  import UnevenField from "../UnevenField.svelte";

  export let drug: 薬品情報Edit | undefined;
  export let at: string;
  export let kouhiSet: KouhiSet;
  export let onCancel: () => void;
  export let onEnter: () => void;
  export let onChange: () => void;
  export let onPrefab: (prefab: RP剤情報) => void;

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    if (drug?.isEditing()) {
      alert("編集中です。");
      return;
    }
    onEnter();
  }

  function doDrugChange() {
    drug = drug;
    onChange();
  }
</script>

{#if drug}
  <div class="top">
    <JohoKubunField
      bind:isEditing={drug.薬品レコード.isEditing情報区分}
      bind:情報区分={drug.薬品レコード.情報区分}
      onFieldChange={doDrugChange}
    />
    <DrugNameField
      {drug}
      {at}
      bind:isEditing={drug.薬品レコード.isEditing薬品コード}
      onFieldChange={doDrugChange}
      onPrefab={onPrefab}
    />
    <UnevenField
      bind:不均等レコード={drug.不均等レコード}
      onFieldChange={doDrugChange}
      bind:isEditing={drug.isEditing不均等レコード}
    />
    <DrugAmountField
      {drug}
      bind:isEditing={drug.薬品レコード.isEditing分量}
      onFieldChange={doDrugChange}
    />
    <DrugSupplField {drug} onFieldChange={doDrugChange} />
    <KouhiField {kouhiSet} {drug} onFieldChange={doDrugChange} />

    <div class="commands">
      <button class="primary" on:click={doEnter}>入力</button>
      <button on:click={doCancel}>キャンセル</button>
    </div>
  </div>
{/if}

<style>
  .top {
    margin: 10px 0;
    border: 1px solid gray;
    padding: 10px;
  }

  .commands {
    margin-top: 10px;
    text-align: right;
  }

  .commands button {
    font-size: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #ddd;
  }

  .commands button:hover {
    background-color: #ccc;
  }

  .commands button.primary {
    background-color: rgba(0, 0, 255, 1);
    color: white;
  }

  .commands button.primary:hover {
    background-color: rgba(0, 0, 255, 0.6);
  }
</style>
