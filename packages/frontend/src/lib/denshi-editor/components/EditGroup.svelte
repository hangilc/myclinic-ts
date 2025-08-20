<script lang="ts">
  import type { RP剤情報Edit, 薬品情報Edit } from "../denshi-edit";
  import type { KouhiSet } from "../kouhi-set";
  import DrugUsageField from "./DrugUsageField.svelte";
  import DrugForm from "./edit-group/DrugForm.svelte";
  import DrugsList from "./edit-group/DrugsList.svelte";
  import TimesField from "./TimesField.svelte";
  import UsageSupplField from "./UsageSupplField.svelte";
  import Commands from "./workarea/Commands.svelte";
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

  function doDrugEnter() {
    if( drug ){
      const curr = drug;
      group.薬品情報グループ = group.薬品情報グループ.map(d => d.id === curr.id ? curr: d);
    }
    aux.drug = undefined;
    aux = aux;
    group = group;
  }
</script>

<Workarea>
  <Title>薬品グループ編集</Title>
  <DrugsList drugs={group.薬品情報グループ} onSelect={doDrugSelect}/>
  <DrugForm drug={drug} onCancel={doDrugCancel} onEnter={doDrugEnter} {at} {kouhiSet}/>
  <ZaikeiKubunField
    bind:剤形区分={group.剤形レコード.剤形区分}
    bind:isEditing={group.剤形レコード.isEditing剤形区分}
    onFieldChange={onGroupChange}
  />
  <DrugUsageField
    group={group}
    bind:isEditing={group.用法レコード.isEditing用法コード}
    onFieldChange={onGroupChange}
  />
  <TimesField
    group={group}
    bind:isEditing={group.剤形レコード.isEditing調剤数量}
    onFieldChange={onGroupChange}
  />
  <UsageSupplField group={group} onFieldChange={onGroupChange} />
  <Commands>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>
