<script lang="ts">
  import type { RP剤情報Wrapper, 薬品情報Wrapper } from "../denshi-tmpl";
  import DrugAmountField from "./DrugAmountField.svelte";
  import DrugNameField from "./DrugNameField.svelte";
  import DrugSupplField from "./DrugSupplField.svelte";
  import DrugUsageField from "./DrugUsageField.svelte";
  import JohoKubunField from "./JohoKubunField.svelte";
  import TimesField from "./TimesField.svelte";
  import UnevenField from "./UnevenField.svelte";
  import UsageSupplField from "./UsageSupplField.svelte";
  import Commands from "./workarea/Commands.svelte";
  import SmallLink from "./workarea/SmallLink.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import ZaikeiKubunField from "./ZaikeiKubunField.svelte";

  export let destroy: () => void;
  export let group: RP剤情報Wrapper;
  export let drugId: number;
  export let at: string;
  export let onChange: () => void;
  let data = group.clone();
  let drug = data.薬品情報グループ.filter((d) => d.id === drugId)[0];

  let isEditingJohoKubun = false;
  let isEdigintName = drug.data.薬品レコード.薬品コード === "";
  let isEditingUneven = false;
  let isEditingDrugAmount = false;
  let isEditingDrugSuppl = false;
  let isEditingZaikeiKubun = false;
  let isEditingUsage = false;
  let isEditingTimes = false;
  let isEditingUsageSuppl = false;

  function confirmNotEditing(): boolean {
    if (isEditingJohoKubun) {
      alert("情報区分が編集中です。");
      return false;
    }
    if (isEdigintName) {
      alert("薬品名が編集中です。");
      return false;
    }
    if (isEditingUneven) {
      alert("不均等レコードが編集中です。");
      return false;
    }
    if (isEditingDrugAmount) {
      alert("薬品分量が編集中です。");
      return false;
    }
    if (isEditingDrugSuppl) {
      alert("薬品補足が編集中です。");
      return false;
    }
    if (isEditingZaikeiKubun) {
      alert("　剤型区分が編集中です。");
      return false;
    }
    if (isEditingUsage) {
      alert("用法が編集中です。");
      return false;
    }
    if (isEditingTimes) {
      alert("日数・回数が編集中です。");
      return false;
    }
    if (isEditingUsageSuppl) {
      alert("用法補足が編集中です。");
      return false;
    }

    return true;
  }

  function onFieldChange() {
    drug = drug;
  }

  function doCancel() {
    destroy();
  }

  function doEnter() {
    if( !confirmNotEditing() ){
      return;
    }
    group.assign(data);
    destroy();
    onChange();
  }


  function addDrugSuppl(): void {
    let drug = data.findDrugById(drugId);
    if( !drug ){
      throw new Error(`no such drug: ${drugId}`);
    }
    drug.addSuppl("");
    onFieldChange();
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
  <DrugAmountField {drug} bind:isEditing={isEditingDrugAmount} {onFieldChange} />
  <DrugSupplField {drug} bind:isEditing={isEditingDrugSuppl} {onFieldChange} />
  <ZaikeiKubunField
    bind:剤形区分={data.data.剤形レコード.剤形区分}
    bind:isEditing={isEditingZaikeiKubun}
    {onFieldChange}
  />
  <DrugUsageField {group} bind:isEditing={isEditingUsage} {onFieldChange} />
  <TimesField {group} bind:isEditing={isEditingTimes} {onFieldChange} />
  <UsageSupplField
    {group}
    bind:isEditing={isEditingUsageSuppl}
    {onFieldChange}
  />
  <Commands>
    <div class="sub-commands">
      <SmallLink onClick={addDrugSuppl}>薬品補足追加</SmallLink>

    </div>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>

<style>
  .sub-commands {
    text-align: left;
    margin-bottom: 6px;
  }
</style>
