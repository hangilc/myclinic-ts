<script lang="ts">
  import {
  RP剤情報Edit,
    不均等レコードEdit,
    用法補足レコードEdit,
    薬品情報Edit,
    薬品補足レコードEdit,
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
  import JohoKubunField from "./JohoKubunField.svelte";
  import DrugNameField from "./DrugNameField.svelte";
  import UnevenField from "./UnevenField.svelte";
  import DrugAmountField from "./DrugAmountField.svelte";
  import DrugSupplField from "./DrugSupplField.svelte";
  import KouhiField from "./KouhiField.svelte";
  import {
    convertRP剤情報ToPrescOfPrefab,
    createDrugPrefab,
    listDrugPrefabByName,
    type DrugPrefab,
  } from "@/lib/drug-prefab";
  import { cache } from "@/lib/cache";
  import { validateRP剤情報 } from "@/lib/validate-presc-info";
  import api from "@/lib/api";
  import SmallLink from "./workarea/SmallLink.svelte";
  import {
    hasHenkoufukaDrugSuppl,
    hasIppoukaUsageSuppl,
    hasKanjakibouDrugSuppl,
    henkoufukaDrugSuppl,
    ippoukaUsageSuppl,
    kanjakibouDrugSuppl,
  } from "../helper";
  import DrugPrefabDialog from "@/lib/drug-prefab-dialog/DrugPrefabDialog.svelte";
  import ShowCommentDialog from "./ShowCommentDialog.svelte";
  
  export let group: RP剤情報Edit;
  export let drug: 薬品情報Edit | undefined;
  export let at: string;
  export let kouhiSet: KouhiSet;
  export let isNewDrug: boolean = false;
  export let onCancel: () => void;
  export let onEnter: () => void;
  let origName: string | undefined =
    drug && drug.薬品レコード.薬品コード === ""
      ? drug.薬品レコード.薬品名称
      : undefined;
  let origUsage: string | undefined =
    group.用法レコード.用法コード === ""
      ? group.用法レコード.用法名称
      : undefined;
  let addToPrefab = false;
  let isConvertibleToPrefab = false;
  let addToDrugNameConv = true;
  let addToDrugUsageConv = true;
  let editPrefabAfterEntered = false;
  let prefabs: DrugPrefab[] = [];

  $: updateIsConvertibleToPrefab(group, drug);
  $: updateAddToPrefab(drug);
  $: setupPrefabs(drug?.薬品レコード.薬品名称);

  function doCancel() {
    onCancel();
  }

  async function doEnter() {
    if (drug) {
      const causes: string[] = [];
      if (drug.isEditing(causes)) {
        alert("薬品が編集中です。\n" + causes.join("・"));
        return;
      }
    }
    if (drug && isNewDrug) {
      group.薬品情報グループ.push(drug);
    }
    onEnter();
    if (addToPrefab) {
      await doAddToPrefab();
    }
    if (addToDrugNameConv) {
      await doAddToDrugNameConv();
    }
    if (addToDrugUsageConv) {
      await doAddToDrugUsageConv();
    }
  }

  function doGroupChange() {
    group = group;
  }

  function doDrugChange() {
    drug = drug;
  }

  function doDelete() {
    if (drug) {
      let curr = drug;
      group.薬品情報グループ = group.薬品情報グループ.filter(
        (d) => d.id !== curr.id,
      );
      onEnter();
    }
  }

  async function addAlias(prefab: DrugPrefab) {
    const name = prefab.presc.薬品情報グループ[0].薬品レコード.薬品名称;
    if (name.startsWith("【般】")) {
      let ms = await api.listIyakuhinMasterByIppanmei(name, at);
      ms = ms.filter((m) => m.senteiRyouyouKubun !== 2 && m.kouhatsu === "0");
      ms.forEach((m) => prefab.alias.push(m.name));
    } else {
      let m = await api.getIyakuhinMaster(
        parseInt(prefab.presc.薬品情報グループ[0].薬品レコード.薬品コード),
        at,
      );
      if (m.ippanmei !== "") {
        prefab.alias.push(m.ippanmei);
      }
    }
  }

  async function doAddToPrefab() {
    if( !drug ){
      return;
    }
    const prescGroup = group.toObject();
    const prescDrug = drug.toObject();
    prescGroup.薬品情報グループ = [prescDrug];
    const presc = convertRP剤情報ToPrescOfPrefab(prescGroup);
    const prefab = createDrugPrefab(presc);
    await addAlias(prefab);
    const list = await cache.getDrugPrefabList();
    list.push(prefab);
    await cache.setDrugPrefabList(list);
    if (editPrefabAfterEntered) {
      const d: DrugPrefabDialog = new DrugPrefabDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          editId: prefab.id,
        },
      });
    }
  }

  async function doAddToDrugNameConv() {
    if (origName && drug && drug.薬品レコード.薬品コード !== "") {
      const src = origName;
      const dst = drug.薬品レコード.薬品名称;
      const map = await cache.getDrugNameConv();
      map[src] = dst;
      await cache.setDrugNameConv(map);
    }
  }

  async function doAddToDrugUsageConv() {
    if (origUsage && group.用法レコード.用法コード !== "") {
      const src = origUsage;
      const dst = group.用法レコード.用法名称;
      const map = await cache.getDrugUsageConv();
      map[src] = dst;
      await cache.setDrugUsageConv(map);
    }
  }

  async function updateIsConvertibleToPrefab(
    group: RP剤情報Edit,
    drug: 薬品情報Edit | undefined,
  ) {
    if (drug === undefined) {
      isConvertibleToPrefab = false;
      return;
    }
    const g = group.toObject();
    const d = drug.toObject();
    g.薬品情報グループ = [d];
    const err = await validateRP剤情報(g, at);
    const ok = err === undefined;
    isConvertibleToPrefab = ok;
  }

  async function updateAddToPrefab(drug: 薬品情報Edit | undefined) {
    if (drug === undefined) {
      addToPrefab = false;
      return;
    }
    const fabsList = await cache.getDrugPrefabList();
    let found = false;
    for (let prefab of fabsList) {
      if (
        prefab.presc.薬品情報グループ[0].薬品レコード.薬品名称 ===
        drug.薬品レコード.薬品名称
      ) {
        found = true;
        break;
      }
    }
    addToPrefab = !found;
  }

  function doHenkouFuka(): void {
    if (drug) {
      if (!hasHenkoufukaDrugSuppl(drug.薬品補足レコードAsList())) {
        let suppl = 薬品補足レコードEdit.fromObject(henkoufukaDrugSuppl());
        suppl.isEditing = false;
        drug.add薬品補足レコード(suppl);
        doDrugChange();
      }
    }
  }

  function doKanjakibou(): void {
    if (drug) {
      if (!hasKanjakibouDrugSuppl(drug.薬品補足レコードAsList())) {
        let suppl = 薬品補足レコードEdit.fromObject(kanjakibouDrugSuppl());
        suppl.isEditing = false;
        drug.add薬品補足レコード(suppl);
        doDrugChange();
      }
    }
  }

  function addDrugSuppl(): void {
    if (drug) {
      let suppl = 薬品補足レコードEdit.fromInfo("");
      suppl.isEditing = true;
      drug.add薬品補足レコード(suppl);
      doDrugChange();
    }
  }

  function doUneven(): void {
    if (drug) {
      if (drug.不均等レコード === undefined) {
        let edit: 不均等レコードEdit = 不均等レコードEdit.fromObject({
          不均等１回目服用量: "1",
          不均等２回目服用量: "2",
        });
        drug.不均等レコード = edit;
      }
      drug.isEditing不均等レコード = true;
      doDrugChange();
    }
  }

  function doIppouka(): void {
    let suppl = 用法補足レコードEdit.fromObject(ippoukaUsageSuppl());
    group.addUsageSuppl(suppl);
    doGroupChange();
  }

  function doAddUsageSuppl(): void {
    let suppl: 用法補足レコードEdit = 用法補足レコードEdit.fromInfo("");
    suppl.isEditing用法補足情報 = true;
    group.addUsageSuppl(suppl);
    doGroupChange();
  }

  async function doNameChange() {
    doDrugChange();
  }

  async function setupPrefabs(drugName: string | undefined) {
    console.log("enter setupPrefabs");
    if( drugName ){
      prefabs = listDrugPrefabByName(await cache.getDrugPrefabList(), drugName);
    } else {
      prefabs = [];
    }
  }

  function doShowComment() {
    if( prefabs.length === 0 ){
      return;
    }
    const d: ShowCommentDialog = new ShowCommentDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        prefabs,
      }
    })
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
      {isNewDrug}
      bind:isEditing={drug.薬品レコード.isEditing薬品コード}
      onDrugChange={doNameChange}
      onGroupChangeRequest={(f) => {
        const groupObj = group.toObject();
        f(groupObj);
        RP剤情報Edit.fromObject(groupObj).assignContentTo(group);
        group = group;
      }}
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
  {#if origName && drug && drug.薬品レコード.薬品コード !== "" && origName !== drug.薬品レコード.薬品名称}
    <div>
      <input type="checkbox" bind:checked={addToDrugNameConv} />
      {origName} → {drug.薬品レコード.薬品名称}
    </div>
  {/if}
  {#if origUsage && group.用法レコード.用法コード !== "" && origUsage !== group.用法レコード.用法名称}
    <div>
      <input type="checkbox" bind:checked={addToDrugUsageConv} />
      {origUsage} → {group.用法レコード.用法名称}
    </div>
  {/if}
  {#if isConvertibleToPrefab}
    <div>
      <input type="checkbox" bind:checked={addToPrefab} /> 処方例に追加
      <input type="checkbox" bind:checked={editPrefabAfterEntered} /> 後編集
    </div>
  {/if}
  <Commands>
    <div class="sub-commands">
      {#if prefabs.length > 0 && prefabs.some(pre => pre.comment)}
        <SmallLink onClick={doShowComment}>コメント閲覧</SmallLink>
      {/if}
      {#if drug && !hasHenkoufukaDrugSuppl(drug.薬品補足レコードAsList())}
        <SmallLink onClick={doHenkouFuka}>変更不可</SmallLink>
      {/if}
      {#if drug && !hasKanjakibouDrugSuppl(drug.薬品補足レコードAsList())}
        <SmallLink onClick={doKanjakibou}>患者希望</SmallLink>
      {/if}
      <SmallLink onClick={addDrugSuppl}>薬品補足</SmallLink>
      <SmallLink onClick={doUneven}>不均等</SmallLink>
      {#if !hasIppoukaUsageSuppl(group.用法補足レコードAsList())}
        <SmallLink onClick={doIppouka}>一包化</SmallLink>
      {/if}
      <SmallLink onClick={doAddUsageSuppl}>用法補足</SmallLink>
    </div>
    {#if drug}
      <Link onClick={doDelete}>薬品削除</Link>
    {/if}
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
