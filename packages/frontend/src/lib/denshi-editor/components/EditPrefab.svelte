<script lang="ts">
  import type { KouhiSet } from "../kouhi-set";
  import DrugUsageField from "./DrugUsageField.svelte";
  import TimesField from "./TimesField.svelte";
  import UsageSupplField from "./UsageSupplField.svelte";
  import Commands from "./workarea/Commands.svelte";
  import Link from "./workarea/Link.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import ZaikeiKubunField from "./ZaikeiKubunField.svelte";
  import JohoKubunField from "./JohoKubunField.svelte";
  import DrugNameField from "./DrugNameField.svelte";
  import UnevenField from "./UnevenField.svelte";
  import DrugAmountField from "./DrugAmountField.svelte";
  import DrugSupplField from "./DrugSupplField.svelte";
  import KouhiField from "./KouhiField.svelte";
  import {
  DrugPrefabEdit,
    PrescOfPrefabEdit,
    type DrugPrefab,
    type PrescOfPrefab,
  } from "@/lib/drug-prefab";
  import AliasField from "./prefab/AliasField.svelte";
  import TagField from "./prefab/TagField.svelte";

  export let prefab: DrugPrefab;
  export let at: string;
  export let kouhiSet: KouhiSet;
  export let onCancel: () => void;
  export let onEnter: () => void;
  export let onDelete: () => void;

  let edit: DrugPrefabEdit = DrugPrefabEdit.fromDrugPrefab(prefab);

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    edit.assignToDrugPrefab(prefab);
    onEnter();
  }

  function onGroupChange() {
    edit = edit;
  }

  function doDrugChange() {}

  function doDelete() {
    onDelete();
  }

  function doPrefab(value: PrescOfPrefab) {
    edit.presc = PrescOfPrefabEdit.fromPrescOfPrefab(value);
    edit = edit;
  }

  function doPrefabChange() {

  }
</script>

<Workarea>
  <Title>薬品グループ編集</Title>
  <JohoKubunField
    bind:isEditing={edit.presc.薬品情報グループ[0].薬品レコード.isEditing情報区分}
    bind:情報区分={edit.presc.薬品情報グループ[0].薬品レコード.情報区分}
    onFieldChange={doDrugChange}
  />
  <DrugNameField
    drug={edit.presc.薬品情報グループ[0]}
    {at}
    bind:isEditing={edit.presc.薬品情報グループ[0].薬品レコード.isEditing薬品コード}
    onPrefab={doPrefab}
    onFieldChange={doDrugChange}
  />
  <UnevenField
    bind:不均等レコード={edit.presc.薬品情報グループ[0].不均等レコード}
    onFieldChange={doDrugChange}
    bind:isEditing={edit.presc.薬品情報グループ[0].isEditing不均等レコード}
  />
  <DrugAmountField
    drug={edit.presc.薬品情報グループ[0]}
    bind:isEditing={edit.presc.薬品情報グループ[0].薬品レコード.isEditing分量}
    onFieldChange={doDrugChange}
  />
  <DrugSupplField
    drug={edit.presc.薬品情報グループ[0]}
    onFieldChange={doDrugChange}
  />
  <KouhiField
    {kouhiSet}
    drug={edit.presc.薬品情報グループ[0]}
    onFieldChange={doDrugChange}
  />
  <ZaikeiKubunField
    bind:剤形区分={edit.presc.剤形レコード.剤形区分}
    bind:isEditing={edit.presc.剤形レコード.isEditing剤形区分}
    onFieldChange={onGroupChange}
  />
  <DrugUsageField
    group={edit.presc}
    bind:isEditing={edit.presc.用法レコード.isEditing用法コード}
    onFieldChange={onGroupChange}
  />
  <TimesField
    group={edit.presc}
    bind:isEditing={edit.presc.剤形レコード.isEditing調剤数量}
    onFieldChange={onGroupChange}
  />
  <UsageSupplField group={edit.presc} onFieldChange={onGroupChange} />
  <AliasField bind:alias={edit.alias} onFieldChange={doPrefabChange}/>
  <TagField bind:tag={edit.tag} onFieldChange={doPrefabChange}/>
  <Commands>
    <Link onClick={doDelete}>薬品削除</Link>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>
