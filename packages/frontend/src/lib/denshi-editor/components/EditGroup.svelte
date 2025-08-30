<script lang="ts">
  import {
    剤形レコードEdit,
    用法レコードEdit,
    用法補足レコードEdit,
    薬品情報Edit,
    type RP剤情報Edit,
  } from "../denshi-edit";
  import type { KouhiSet } from "../kouhi-set";
  import DrugUsageField from "./DrugUsageField.svelte";
  import TimesField from "./TimesField.svelte";
  import UsageSupplField from "./UsageSupplField.svelte";
  import Commands from "./workarea/Commands.svelte";
  import Link from "./workarea/Link.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import ZaikeiKubunField from "./ZaikeiKubunField.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import JohoKubunField from "./JohoKubunField.svelte";
  import DrugNameField from "./DrugNameField.svelte";
  import UnevenField from "./UnevenField.svelte";
  import DrugAmountField from "./DrugAmountField.svelte";
  import DrugSupplField from "./DrugSupplField.svelte";
  import KouhiField from "./KouhiField.svelte";

  export let group: RP剤情報Edit;
  export let drug: 薬品情報Edit | undefined;
  // export let drugOrig: 薬品情報Edit | undefined;
  export let at: string;
  export let kouhiSet: KouhiSet;
  export let onCancel: () => void;
  export let onEnter: () => void;
  // export let onTargetDrugChange: (targetDrug: 薬品情報Edit | undefined) => void;

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    if (drug) {
      if (drug.isEditing()) {
        alert("薬品が編集中です。");
        return;
      }
    }
    onEnter();
  }

  function onGroupChange() {
    group = group;
  }

  // function validateForEnter(drug: 薬品情報Edit): string | undefined {
  //   if (drug.isEditing()) {
  //     return "薬品の編集中です。";
  //   }
  //   if (drug.薬品レコード.薬品名称 === "") {
  //     return "薬品の種類が設定されていません。";
  //   }
  //   if (drug.薬品レコード.分量 === "") {
  //     return "薬品の分量が設定されていません。";
  //   }
  //   return undefined;
  // }

  // function doDrugEnter() {
  //   if (drug) {
  //     let err = validateForEnter(drug);
  //     if (err) {
  //       alert(err);
  //       return;
  //     }
  //     const curr = drug;
  //     let found = false;
  //     if (drugOrig) {
  //       for (let i = 0; i < group.薬品情報グループ.length; i++) {
  //         let d = group.薬品情報グループ[i];
  //         if (d.id === curr.id) {
  //           group.薬品情報グループ[i] = curr;
  //           found = true;
  //           break;
  //         }
  //       }
  //     }
  //     if (!found) {
  //       group.薬品情報グループ.push(curr);
  //     }
  //   }
  //   drug = undefined;
  //   onTargetDrugChange(drug);
  //   group = group;
  // }

  function doDrugChange() {}

  // function doAddDrug() {
  //   if (!drug) {
  //     drug = 薬品情報Edit.fromObject(createEmpty薬品情報());
  //     onTargetDrugChange(drug);
  //     drugOrig = undefined;
  //   }
  // }

  function doDelete() {
    if (drug) {
      let curr = drug;
      group.薬品情報グループ = group.薬品情報グループ.filter(
        (d) => d.id !== curr.id,
      );
      onEnter();
    }
  }

  function doPrefab(prefab: RP剤情報) {
    if (drug) {
      const pre = 薬品情報Edit.fromObject(prefab.薬品情報グループ[0]);
      drug.薬品レコード = pre.薬品レコード;
      drug.単位変換レコード = pre.単位変換レコード;
      drug.不均等レコード = pre.不均等レコード;
      drug.負担区分レコード = pre.負担区分レコード;
      drug.薬品１回服用量レコード = pre.薬品１回服用量レコード;
      drug.薬品補足レコード = pre.薬品補足レコード;
      drug.ippanmei = pre.ippanmei;
      drug.ippanmeicode = pre.ippanmeicode;
      drug.isEditing不均等レコード = pre.isEditing不均等レコード;
      drug.isSelected = pre.isSelected;
      if (
        group.薬品情報グループ.length === 1) {
        Object.assign(group, {
          剤形レコード: 剤形レコードEdit.fromObject(prefab.剤形レコード),
          用法レコード: 用法レコードEdit.fromObject(prefab.用法レコード),
          用法補足レコード: prefab.用法補足レコード
            ? prefab.用法補足レコード.map((r) =>
                用法補足レコードEdit.fromObject(r),
              )
            : undefined,
        });
        group = group;
      }
    }
  }
</script>

<Workarea>
  <Title>薬品グループ編集</Title>
  {#if drug}
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
      onPrefab={doPrefab}
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
  {/if}
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
      <Link onClick={doDelete}>薬品削除</Link>
    {/if}
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>
