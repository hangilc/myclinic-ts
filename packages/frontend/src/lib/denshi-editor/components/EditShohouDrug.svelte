<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import {
    剤形レコードEdit,
    用法レコードEdit,
    用法補足レコードEdit,
    薬品情報Edit,
    type RP剤情報Edit,
  } from "../denshi-edit";
  import type { KouhiSet } from "../kouhi-set";
  import JohoKubunField from "./JohoKubunField.svelte";
  import DrugNameField from "./DrugNameField.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import UnevenField from "./UnevenField.svelte";
  import DrugAmountField from "./DrugAmountField.svelte";
  import DrugSupplField from "./DrugSupplField.svelte";
  import KouhiField from "./KouhiField.svelte";
  import ZaikeiKubunField from "./ZaikeiKubunField.svelte";
  import DrugUsageField from "./DrugUsageField.svelte";
  import TimesField from "./TimesField.svelte";
  import UsageSupplField from "./UsageSupplField.svelte";
  import Commands from "./workarea/Commands.svelte";
  import Link from "./workarea/Link.svelte";

  export let group: RP剤情報Edit;
  export let drug: 薬品情報Edit | undefined;
  export let at: string;
  export let kouhiSet: KouhiSet;
  export let onCancel: () => void;
  export let onEnter: () => void;

  function doDrugChange() {
    drug = drug;
  }

  function doGroupChange() {
    group = group;
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
      drug = drug;
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
        group = group;
      }
    }
  }

  function doDelete() {
    onDelete();
  }

  function doEnter() {
    onEnter();
  }

  function doCancel() {
    onCancel();
  }
</script>

<Workarea>
  <Title>電子処方に変換</Title>
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
    onFieldChange={doGroupChange}
  />
  <DrugUsageField
    {group}
    bind:isEditing={group.用法レコード.isEditing用法コード}
    onFieldChange={doGroupChange}
  />
  <TimesField
    {group}
    bind:isEditing={group.剤形レコード.isEditing調剤数量}
    onFieldChange={doGroupChange}
  />
  <UsageSupplField {group} onFieldChange={doGroupChange} />
  <Commands>
    {#if drug}
      <Link onClick={doDelete}>薬品削除</Link>
    {/if}
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>
