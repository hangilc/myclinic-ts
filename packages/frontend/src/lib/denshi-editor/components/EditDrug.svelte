<script lang="ts">
  import type { 薬品情報Wrapper } from "../denshi-tmpl";
  import DrugNameField from "./DrugNameField.svelte";
  import JohoKubunField from "./JohoKubunField.svelte";
  import UnevenField from "./UnevenField.svelte";
  import Commands from "./workarea/Commands.svelte";
import Title from "./workarea/Title.svelte";
import Workarea from "./workarea/Workarea.svelte";

  export let destroy: () => void;
  export let drug: 薬品情報Wrapper;
  export let at: string;
  export let onChange: () => void;
  let data = drug.clone();

  let isEditingJohoKubun = false;
  let isEdigintName = drug.data.薬品レコード.薬品コード === "";
  let isEditingUneven = false;

  function onFieldChange() {
    data = data;
  }

  function doCancel() {
    destroy();
  }

  function doEnter() {
    console.log("data", data);
    drug.assign(data);
    destroy();
    onChange();
  }
</script>

<Workarea>
  <Title>薬品編集</Title>
  <JohoKubunField bind:isEditing={isEditingJohoKubun} bind:情報区分={data.data.薬品レコード.情報区分} {onFieldChange} />
  <DrugNameField drug={data} {at} bind:isEditing={isEdigintName} {onFieldChange} />
  <UnevenField 不均等レコード={data.data.不均等レコード} {onFieldChange} bind:isEditing={isEditingUneven}/>
  <Commands>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>