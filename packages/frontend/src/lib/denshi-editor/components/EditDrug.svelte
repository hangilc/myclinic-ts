<script lang="ts">
  import {
    不均等レコードEdit,
    用法補足レコードEdit,
    薬品補足レコードEdit,
    type RP剤情報Edit,
  } from "../denshi-edit";
  import {
    freeTextCode,
    hasHenkoufukaDrugSuppl,
    hasIppoukaUsageSuppl,
    hasKanjakibouDrugSuppl,
    henkoufukaDrugSuppl,
    ippoukaUsageSuppl,
    kanjakibouDrugSuppl,
  } from "../helper";
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
  import { DrugCacheHandler, UsageCacheHandler } from "../cache-handler";
  import Link from "./workarea/Link.svelte";
  import { toHankaku } from "@/lib/zenkaku";
  import KouhiField from "./KouhiField.svelte";
  import type { KouhiSet } from "../kouhi-set";

  export let destroy: () => void;
  export let data: RP剤情報Edit;
  export let drugId: number;
  export let at: string;
  export let kouhiSet: KouhiSet;
  export let onChange: () => void;
  export let onCancel: () => void;
  let drug = data.薬品情報グループ.filter((d) => d.id === drugId)[0];
  let drugCacheHandler = new DrugCacheHandler(
    drug.薬品レコード.薬品名称,
    drug.薬品レコード.薬品コード,
    drug.薬品レコード.単位名,
  );
  let usageCacheHandler = new UsageCacheHandler(
    data.用法レコード.用法名称,
    data.用法レコード.用法コード,
  );

  function confirmNotEditing(): boolean {
    if( data.isEditing() ){
      alert("薬剤が編集中です。");
      return false;
    }

    return true;
  }

  function onDrugChange() {
    drug = drug;
  }

  function onGroupChange() {
    data = data;
  }

  function doCancel() {
    destroy();
    onCancel();
  }

  function doEnter() {
    if (!confirmNotEditing()) {
      return;
    }
    destroy();
    onChange();
    handleCache();
  }

  async function handleCache() {
    let kind = drug.getKind();
    if (kind === undefined) {
      throw new Error("invalid drug kind");
    }
    if (
      toHankaku(drugCacheHandler.origDrugUnit) ===
      toHankaku(drug.薬品レコード.単位名)
    ) {
      await drugCacheHandler.handle(
        drug.薬品レコード.薬品名称,
        drug.薬品レコード.薬品コード,
        kind,
      );
    }
    if (
      drug.薬品補足レコードAsList().length === 0 &&
      drug.不均等レコード == undefined &&
      data.用法補足レコードAsList().length === 0 &&
      data.用法レコード.用法コード !== freeTextCode
    ) {
      await usageCacheHandler.handle(
        data.用法レコード.用法名称,
        data.用法レコード.用法コード,
      );
    }
  }

  function addDrugSuppl(): void {
    let drug = data.findDrugById(drugId);
    if (!drug) {
      throw new Error(`no such drug: ${drugId}`);
    }
    let suppl = 薬品補足レコードEdit.fromInfo("");
    suppl.isEditing = true;
    drug.addDrugSuppl(suppl);
    onDrugChange();
  }

  function doHenkouFuka(): void {
    if (!hasHenkoufukaDrugSuppl(drug.薬品補足レコードAsList())) {
      let suppl = 薬品補足レコードEdit.fromObject(henkoufukaDrugSuppl());
      suppl.isEditing = false;
      drug.addDrugSuppl(suppl);
      onDrugChange();
    }
  }

  function doKanjakibou(): void {
    if (!hasKanjakibouDrugSuppl(drug.薬品補足レコードAsList())) {
      let suppl = 薬品補足レコードEdit.fromObject(kanjakibouDrugSuppl());
      suppl.isEditing = false;
      drug.addDrugSuppl(suppl);
      onDrugChange();
    }
  }

  function doUneven(): void {
    if (drug.不均等レコード === undefined) {
      let edit: 不均等レコードEdit = 不均等レコードEdit.fromObject({
        不均等１回目服用量: "1",
        不均等２回目服用量: "2",
      });
      drug.不均等レコード = edit;
    }
    drug.isEditing不均等レコード = true;
    onDrugChange();
  }

  function addUsageSuppl(): void {
    let suppl: 用法補足レコードEdit = 用法補足レコードEdit.fromInfo("");
    data.addUsageSuppl(suppl);
    onGroupChange();
  }

  function doIppouka(): void {
    let suppl = 用法補足レコードEdit.fromObject(ippoukaUsageSuppl());
    data.addUsageSuppl(suppl);
    onGroupChange();
  }

  function onJohoKubunChange() {
    if (drug.薬品レコード.情報区分 === "医薬品") {
      if (data.剤形レコード.剤形区分 === "医療材料") {
        data.剤形レコード.剤形区分 = "内服";
        onGroupChange();
      }
    } else if (drug.薬品レコード.情報区分 === "医療材料") {
      if (data.剤形レコード.剤形区分 !== "医療材料") {
        data.剤形レコード.剤形区分 = "医療材料";
        onGroupChange();
      }
    }
    onDrugChange();
  }

  function doDelete() {
    data.薬品情報グループ = data.薬品情報グループ.filter(
      (d) => d.id !== drugId,
    );
    destroy();
    onChange();
  }
</script>

<Workarea>
  <Title>薬品編集</Title>
  <JohoKubunField
    bind:isEditing={drug.薬品レコード.isEditing情報区分}
    bind:情報区分={drug.薬品レコード.情報区分}
    onFieldChange={onJohoKubunChange}
  />
  <DrugNameField
    {drug}
    {at}
    bind:isEditing={drug.薬品レコード.isEditing薬品コード}
    onFieldChange={onDrugChange}
  />
  <UnevenField
    bind:不均等レコード={drug.不均等レコード}
    onFieldChange={onDrugChange}
    bind:isEditing={drug.isEditing不均等レコード}
  />
  <DrugAmountField
    {drug}
    bind:isEditing={drug.薬品レコード.isEditing分量}
    onFieldChange={onDrugChange}
  />
  <DrugSupplField
    {drug}
    onFieldChange={onDrugChange}
  />
  <KouhiField kouhiSet={kouhiSet} {drug} onFieldChange={onDrugChange}/>
  <ZaikeiKubunField
    bind:剤形区分={data.剤形レコード.剤形区分}
    bind:isEditing={data.剤形レコード.isEditing剤形区分}
    onFieldChange={onDrugChange}
  />
  <DrugUsageField
    group={data}
    bind:isEditing={data.用法レコード.isEditing用法コード}
    onFieldChange={onDrugChange}
  />
  <TimesField
    group={data}
    bind:isEditing={data.剤形レコード.isEditing調剤数量}
    onFieldChange={onDrugChange}
  />
  <UsageSupplField
    group={data}
    onFieldChange={onGroupChange}
  />
  <Commands>
    <div class="sub-commands">
      {#if !hasHenkoufukaDrugSuppl(drug.薬品補足レコードAsList())}
        <SmallLink onClick={doHenkouFuka}>変更不可</SmallLink>
      {/if}
      {#if !hasKanjakibouDrugSuppl(drug.薬品補足レコードAsList())}
        <SmallLink onClick={doKanjakibou}>患者希望</SmallLink>
      {/if}
      <SmallLink onClick={addDrugSuppl}>薬品補足</SmallLink>
      <SmallLink onClick={doUneven}>不均等</SmallLink>
      {#if !hasIppoukaUsageSuppl(data.用法補足レコードAsList())}
        <SmallLink onClick={doIppouka}>一包化</SmallLink>
      {/if}
      <SmallLink onClick={addUsageSuppl}>用法補足</SmallLink>
    </div>
    <Link onClick={doDelete}>削除</Link>
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
