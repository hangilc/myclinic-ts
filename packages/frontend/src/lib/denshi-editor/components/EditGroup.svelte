<script lang="ts">
  import { createEmpty薬品情報 } from "@/lib/denshi-helper";
  import {
    剤形レコードEdit,
    用法レコードEdit,
    用法補足レコードEdit,
    薬品情報Edit,
    type RP剤情報Edit,
  } from "../denshi-edit";
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
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";

  export let group: RP剤情報Edit;
  export let drug: 薬品情報Edit | undefined;
  export let at: string;
  export let kouhiSet: KouhiSet;
  export let onCancel: () => void;
  export let onEnter: () => void;
  let drugOrig = drug ? drug.clone() : undefined;

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    if (drug) {
      if (drug.isEditing()) {
        alert("薬品が編集中です。");
        return;
      }
      if( !drugOrig ){
        group.薬品情報グループ.push(drug);
        group = group;
      }
      drug = undefined;
      drugOrig = undefined;
    }
    onEnter();
  }

  function onGroupChange() {
    group = group;
  }

  function doDrugSelect(selected: 薬品情報Edit) {
    drug = selected;
  }

  function doDrugCancel() {
    if (drug) {
      if (!drugOrig) {
        throw new Error("cannot happen");
      }
      for (let i = 0; i < group.薬品情報グループ.length; i++) {
        if (group.薬品情報グループ[i].id === drug.id) {
          group.薬品情報グループ[i] = drugOrig;
          break;
        }
      }
      drug = undefined;
      group = group;
    } else {
      if (drugOrig) {
        throw new Error("cannot happen");
      }
    }
  }

  function validateForEnter(drug: 薬品情報Edit): string | undefined {
    if (drug.isEditing()) {
      return "薬品の編集中です。";
    }
    if (drug.薬品レコード.薬品名称 === "") {
      return "薬品の種類が設定されていません。";
    }
    if (drug.薬品レコード.分量 === "") {
      return "薬品の分量が設定されていません。";
    }
    return undefined;
  }

  function doDrugEnter() {
    if (drug) {
      let err = validateForEnter(drug);
      if (err) {
        alert(err);
        return;
      }
      const curr = drug;
      let found = false;
      for (let i = 0; i < group.薬品情報グループ.length; i++) {
        let d = group.薬品情報グループ[i];
        if (d.id === curr.id) {
          group.薬品情報グループ[i] = curr;
          found = true;
          break;
        }
      }
      if (!found) {
        group.薬品情報グループ.push(curr);
      }
    }
    drug = undefined;
    group = group;
  }

  function doDrugChange() {}

  function doAddDrug() {
    if (!drug) {
      drug = 薬品情報Edit.fromObject(createEmpty薬品情報());
    }
  }

  function doDeleteDrug() {
    if (drug) {
      let curr = drug;
      group.薬品情報グループ = group.薬品情報グループ.filter(
        (d) => d.id !== curr.id,
      );
      aux.drug = undefined;
      aux = aux;
      group = group;
    }
  }

  function doDrugPrefab(prefab: RP剤情報) {
    if (group.薬品情報グループ.length === 1) {
      Object.assign(group, {
        剤形レコード: 剤形レコードEdit.fromObject(prefab.剤形レコード),
        用法レコード: 用法レコードEdit.fromObject(prefab.用法レコード),
        用法補足レコード: prefab.用法補足レコード
          ? prefab.用法補足レコード.map((r) =>
              用法補足レコードEdit.fromObject(r),
            )
          : undefined,
      });
      aux.drug = drug;
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
    onPrefab={doDrugPrefab}
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
