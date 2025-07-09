<script lang="ts">
  import type { RP剤情報Wrapper, 薬品情報Wrapper } from "../denshi-tmpl";
  import DrugNameField from "./DrugNameField.svelte";
  import DrugSupplField from "./DrugSupplField.svelte";
  import JohoKubunField from "./JohoKubunField.svelte";
  import UnevenField from "./UnevenField.svelte";
  import Commands from "./workarea/Commands.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import ZaikeiKubunField from "./ZaikeiKubunField.svelte";

  export let destroy: () => void;
  export let group: RP剤情報Wrapper;
  export let drugId: number;
  export let at: string;
  export let onChange: () => void;
  let data = group.clone();
  let drug = group.薬品情報グループ.filter((d) => d.id === drugId)[0];

  let isEditingJohoKubun = false;
  let isEdigintName = drug.data.薬品レコード.薬品コード === "";
  let isEditingUneven = false;
  let isEditingDrugSuppl = false;
  let isEditingZaikeiKubun = false;

  function onFieldChange() {
    data = data;
  }

  function doCancel() {
    destroy();
  }

  function doEnter() {
    group.assign(data);
    destroy();
    onChange();
  }
</script>

<Workarea>
  <Title>薬品編集</Title>
  <JohoKubunField
    bind:isEditing={isEditingJohoKubun}
    bind:情報区分={drug.data.薬品レコード.情報区分}
    {onFieldChange}
  />
  <DrugNameField {drug} {at} bind:isEditing={isEdigintName} {onFieldChange} />
  <UnevenField
    不均等レコード={drug.data.不均等レコード}
    {onFieldChange}
    bind:isEditing={isEditingUneven}
  />
  <DrugSupplField {drug} bind:isEditing={isEditingDrugSuppl} />
  <ZaikeiKubunField
    bind:剤形区分={data.data.剤形レコード.剤形区分}
    bind:isEditing={isEditingZaikeiKubun}
    {onFieldChange}
  />
  <Commands>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>
