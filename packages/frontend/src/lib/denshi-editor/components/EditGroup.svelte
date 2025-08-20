<script lang="ts">
  import { createEmpty薬品情報 } from "@/lib/denshi-helper";
  import { 薬品情報Edit, type RP剤情報Edit } from "../denshi-edit";
  import type { KouhiSet } from "../kouhi-set";
  import DrugUsageField from "./DrugUsageField.svelte";
  import DrugForm from "./edit-group/DrugForm.svelte";
  import DrugsList from "./edit-group/DrugsList.svelte";
  import TimesField from "./TimesField.svelte";
  import UsageSupplField from "./UsageSupplField.svelte";
  import Commands from "./workarea/Commands.svelte";
  import Link from "./workarea/Link.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import ZaikeiKubunField from "./ZaikeiKubunField.svelte";

  export let group: RP剤情報Edit;
  export let aux: { drug: 薬品情報Edit | undefined };
  export let at: string;
  export let kouhiSet: KouhiSet;
  export let onCancel: () => void;
  export let onEnter: () => void;

  $: drug = aux.drug?.clone();

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    onEnter();
  }

  function onGroupChange() {
    group = group;
  }

  function doDrugSelect(drug: 薬品情報Edit) {
    aux.drug = drug;
    aux = aux;
  }

  function doDrugCancel() {
    drug = undefined;
  }

  function validateForEnter(drug: 薬品情報Edit): string | undefined {
    if( drug.isEditing() ){
      return "薬品の編集中です。";
    }
    if( drug.薬品レコード.薬品名称 === "" ){
      return "薬品の種類が設定されていません。";
    }
    if( drug.薬品レコード.分量 === "" ){
      return "薬品の分量が設定されていません。";
    }
    return undefined;
  }

  function doDrugEnter() {
    if (drug) {
      let err = validateForEnter(drug);
      if( err ){
        alert(err);
        return;
      }
      const curr = drug;
      let found = false;
      for(let i=0;i<group.薬品情報グループ.length;i++){
        let d = group.薬品情報グループ[i];
        if( d.id === curr.id ){
          group.薬品情報グループ[i] = curr;
          found = true;
          break;
        }
      }
      if( !found ){
        group.薬品情報グループ.push(curr);
      }
    }
    aux.drug = undefined;
    aux = aux;
    group = group;
  }

  function doDrugChange() {}

  function doAddDrug() {
    if (!drug) {
      drug = 薬品情報Edit.fromObject(createEmpty薬品情報());
      aux.drug = drug;
      aux = aux;
    }
  }

  function doDeleteDrug() {
    if( drug ){
      let curr = drug;
      group.薬品情報グループ = group.薬品情報グループ.filter(d => d.id !== curr.id);
      aux.drug = undefined;
      aux = aux;
      group = group;
    }
  }
</script>

<Workarea>
  <Title>薬品グループ編集</Title>
  <DrugsList drugs={group.薬品情報グループ} onSelect={doDrugSelect} />
  <DrugForm
    {drug}
    onCancel={doDrugCancel}
    onEnter={doDrugEnter}
    onChange={doDrugChange}
    {at}
    {kouhiSet}
  />
  <ZaikeiKubunField
    bind:剤形区分={group.剤形レコード.剤形区分}
    bind:isEditing={group.剤形レコード.isEditing剤形区分}
    onFieldChange={onGroupChange}
  />
  <DrugUsageField
    {group}
    bind:isEditing={group.用法レコード.isEditing用法コード}
    onFieldChange={onGroupChange}
  />
  <TimesField
    {group}
    bind:isEditing={group.剤形レコード.isEditing調剤数量}
    onFieldChange={onGroupChange}
  />
  <UsageSupplField {group} onFieldChange={onGroupChange} />
  <Commands>
    {#if drug}
      <Link onClick={doDeleteDrug}>薬品削除</Link>
    {:else}
      <Link onClick={doAddDrug}>薬品追加</Link>
    {/if}
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>
