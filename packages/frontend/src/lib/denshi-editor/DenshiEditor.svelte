<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import { tick } from "svelte";
  import type {
    PrescInfoData,
    提供診療情報レコード,
    薬品情報,
    検査値データ等レコード,
    備考レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import PrescRep from "./PrescRep.svelte";
  import NewDrug from "./NewDrug.svelte";
  import {
    indexRP剤情報,
    index備考レコード,
    index提供診療情報レコード,
    index検査値データ等レコード,
    index用法補足レコード,
    index薬品情報,
    unindexRP剤情報,
    unindex備考レコード,
    unindex提供診療情報レコード,
    unindex検査値データ等レコード,
    unindex薬品情報,
    type RP剤情報Indexed,
    type 備考レコードIndexed,
    type 提供診療情報レコードIndexed,
    type 検査値データ等レコードIndexed,
    type 薬品情報Indexed,
  } from "./denshi-editor-types";
  import EditDrug from "./EditDrug.svelte";
  import NewGroup from "./NewGroup.svelte";
  import ExpirationDate from "./ExpirationDate.svelte";
  import { onshiDateToSqlDate } from "myclinic-util";
  import GroupForm from "./GroupForm.svelte";
  import ChevronDownLink from "./icons/ChevronDownLink.svelte";
  import ChevronUpLink from "./icons/ChevronUpLink.svelte";
  import InfoProviders from "./InfoProviders.svelte";
  import KensaValues from "./KensaValues.svelte";
  import Bikou from "./Bikou.svelte";
  import { runner } from "./helper";
  import { writable, type Writable } from "svelte/store";
  import Link from "./widgets/Link.svelte";
  import SmallLink from "./widgets/SmallLink.svelte";

  export let destroy: () => void;
  export let data: PrescInfoData;
  export let onEnter: (shohou: PrescInfoData) => void;
  let formElement: HTMLElement;
  let upperElement: HTMLElement;
  let clearForm: () => void = () => {};
  let at = shohouDateToSqlDate(data.処方箋交付年月日);
  let groups: RP剤情報Indexed[] = data.RP剤情報グループ.map((g) =>
    indexRP剤情報(g),
  );
  let 使用期限年月日: string | undefined = data.使用期限年月日;
  let showAuxMenu = false;
  let 提供診療情報レコード: 提供診療情報レコードIndexed[] = (
    data.提供情報レコード?.提供診療情報レコード ?? []
  ).map(index提供診療情報レコード);
  let 検査値データ等レコード: 検査値データ等レコードIndexed[] = (
    data.提供情報レコード?.検査値データ等レコード ?? []
  ).map(index検査値データ等レコード);
  let 備考レコード: 備考レコードIndexed[] = (data.備考レコード ?? []).map(
    index備考レコード,
  );
  let isEditing: Writable<boolean> = writable(false);

  async function scrollToTop() {
    await tick();
    if (upperElement) {
      upperElement.scrollTop = 0;
    }
  }

  function doEnter() {
    let shohou: PrescInfoData = Object.assign({}, data, {
      RP剤情報グループ: groups.map(unindexRP剤情報),
      使用期限年月日,
      備考レコード: get備考レコード(),
      提供情報レコード: get提供情報レコード(),
    });
    onEnter(shohou);
    destroy();
  }

  function get提供診療情報レコード(): 提供診療情報レコード[] | undefined {
    if (提供診療情報レコード.length === 0) {
      return undefined;
    }
    return 提供診療情報レコード.map(unindex提供診療情報レコード);
  }

  function get検査値データ等レコード(): 検査値データ等レコード[] | undefined {
    if (検査値データ等レコード.length === 0) {
      return undefined;
    }
    return 検査値データ等レコード.map(unindex検査値データ等レコード);
  }

  function get提供情報レコード() {
    let a = get提供診療情報レコード();
    let b = get検査値データ等レコード();
    if (a === undefined && b === undefined) {
      return undefined;
    } else {
    }
    return {
      提供診療情報レコード:
        提供診療情報レコード.map(unindex提供診療情報レコード),
      検査値データ等レコード:
        検査値データ等レコード.map(unindex検査値データ等レコード),
    };
  }

  function get備考レコード(): 備考レコード[] | undefined {
    if (備考レコード.length === 0) {
      return undefined;
    }
    return 備考レコード.map(unindex備考レコード);
  }

  function shohouDateToSqlDate(shohouDate: string): string {
    let y = shohouDate.substring(0, 4);
    let m = shohouDate.substring(4, 6);
    let d = shohouDate.substring(6, 8);
    return `${y}-${m}-${d}`;
  }

  function doAddDrug(
    group: RP剤情報Indexed,
    resumeToEditGroup: boolean = false,
  ) {
    clearForm();
    const e: NewDrug = new NewDrug({
      target: formElement,
      props: {
        isEditing,
        at,
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onEnter: (drug: 薬品情報) => {
          group.薬品情報グループ.push(index薬品情報(drug));
          groups = groups;
          if (resumeToEditGroup) {
            doUsageSelect(group);
          }
        },
        onCancel: () => {
          if (resumeToEditGroup) {
            doUsageSelect(group);
          }
        },
        group,
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doDrugSelect(group: RP剤情報Indexed, drug: 薬品情報Indexed) {
    clearForm();
    const e: EditDrug = new EditDrug({
      target: formElement,
      props: {
        at,
        drug: unindex薬品情報(drug),
        group,
        剤形区分: group.剤形レコード.剤形区分,
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onEnter: (updated: 薬品情報) => {
          group.薬品情報グループ = group.薬品情報グループ.map((d) =>
            d.id === drug.id ? index薬品情報(updated) : d,
          );
          groups = groups;
        },
        onDelete: () => {
          group.薬品情報グループ = group.薬品情報グループ.filter(
            (d) => d.id !== drug.id,
          );
          if (group.薬品情報グループ.length === 0) {
            groups = groups.filter((g) => g.id !== group.id);
          } else {
            groups = groups;
          }
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doUsageSelect(group: RP剤情報Indexed) {
    clearForm();
    const e: GroupForm = new GroupForm({
      target: formElement,
      props: {
        isEditing,
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onDeleteDrugs: (drugIds: number[]) => {
          group.薬品情報グループ = group.薬品情報グループ.filter(
            (d) => !drugIds.includes(d.id),
          );
          if (group.薬品情報グループ.length === 0) {
            groups = groups.filter((g) => g.id !== group.id);
          } else {
            groups = groups;
            doUsageSelect(group);
          }
        },
        onAddDrug: () => {
          doAddDrug(group, true);
        },
        用法コード: group.用法レコード.用法コード,
        用法名称: group.用法レコード.用法名称,
        調剤数量: group.剤形レコード.調剤数量,
        剤形区分: group.剤形レコード.剤形区分,
        用法補足レコード:
          group.用法補足レコード?.map((r) => index用法補足レコード(r)) ?? [],
        drugs: group.薬品情報グループ,
        onChange: (data) => {
          let g = findGroupById(group.id);
          if (g) {
            g.用法レコード = Object.assign({}, g.用法レコード, {
              用法コード: data.用法コード,
              用法名称: data.用法名称,
            });
            g.用法補足レコード = data.用法補足レコード;
            g.剤形レコード = Object.assign({}, g.剤形レコード, {
              調剤数量: data.調剤数量,
            });
            groups = groups;
          }
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doAddGroup() {
    clearForm();
    const e: NewGroup = new NewGroup({
      target: formElement,
      props: {
        isEditing,
        onDone: () => {
          clearForm();
          clearForm = () => {};
          $isEditing = false;
        },
        at,
        onEnter: (group) => {
          groups.push(indexRP剤情報(group));
          groups = groups;
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doExpirationDate() {
    clearForm();
    const e: ExpirationDate = new ExpirationDate({
      target: formElement,
      props: {
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        使用期限年月日,
        onChange: (value) => {
          使用期限年月日 = value;
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doAddInfoProvider() {
    clearForm();
    const e: InfoProviders = new InfoProviders({
      target: formElement,
      props: {
        提供診療情報レコード: [
          ...提供診療情報レコード,
          index提供診療情報レコード({
            薬品名称: "",
            コメント: "",
          }),
        ],
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onChange: (data) => {
          提供診療情報レコード = data;
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doEditInfoProviders() {
    clearForm();
    const e: InfoProviders = new InfoProviders({
      target: formElement,
      props: {
        提供診療情報レコード,
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onChange: (data) => {
          提供診療情報レコード = data;
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doAddKensa() {
    clearForm();
    const e: KensaValues = new KensaValues({
      target: formElement,
      props: {
        検査値データ等レコード: [
          ...検査値データ等レコード,
          index検査値データ等レコード({ 検査値データ等: "" }),
        ],
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onChange: (data) => {
          検査値データ等レコード = data;
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doEditKensa() {
    clearForm();
    const e: KensaValues = new KensaValues({
      target: formElement,
      props: {
        検査値データ等レコード,
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onChange: (data) => {
          検査値データ等レコード = data;
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doAddBikou() {
    clearForm();
    const e: Bikou = new Bikou({
      target: formElement,
      props: {
        備考レコード: [
          ...備考レコード,
          index備考レコード({
            備考: "",
          }),
        ],
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onChange: (data) => {
          備考レコード = data;
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function doAddBikouIppouka() {
    備考レコード = [ ...備考レコード, index備考レコード({ 備考: "一包化", }) ];
  }

  function doEditBikou() {
    clearForm();
    const e: Bikou = new Bikou({
      target: formElement,
      props: {
        備考レコード: 備考レコード,
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onChange: (data) => {
          備考レコード = data;
        },
      },
    });
    clearForm = () => e.$destroy();
    scrollToTop();
  }

  function findGroupById(id: number): RP剤情報Indexed | undefined {
    for (let g of groups) {
      if (g.id === id) {
        return g;
      }
    }
    return undefined;
  }

  function doCancel() {
    destroy();
  }

  function hide_aux_menu() {
    showAuxMenu = false;
  }

  function auxInvoke(...fs: (() => any)[]): () => void {
    return runner(hide_aux_menu, ...fs);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Dialog2 title="電子処方箋編集" {destroy}>
  <div class="upper denshi-editor" bind:this={upperElement}>
    <div>
      <div class="aux-menu">
        <button on:click={doAddGroup}>追加</button>
        {#if !$isEditing}
          <button on:click={doEnter}>入力</button>
        {/if}
        <button on:click={doCancel}>キャンセル</button>
        {#if showAuxMenu === false}
          <ChevronDownLink onClick={() => (showAuxMenu = true)} />
        {:else}
          <ChevronUpLink onClick={() => (showAuxMenu = false)} />
        {/if}
        {#if showAuxMenu}
          <div class="aux-menu-panel">
            <SmallLink
              onClick={auxInvoke(doExpirationDate)}
              visible={!使用期限年月日}>有効期限</SmallLink
            >
            <SmallLink onClick={auxInvoke(doAddBikouIppouka)}>一包化</SmallLink>
            <SmallLink onClick={auxInvoke(doAddBikou)}>備考追加</SmallLink>
            <SmallLink onClick={auxInvoke(doAddInfoProvider)}
              >情報提供</SmallLink
            >
            <SmallLink onClick={auxInvoke(doAddKensa)}>検査値</SmallLink>
          </div>
        {/if}
      </div>
      <PrescRep
        {groups}
        onDrugSelect={doDrugSelect}
        onUsageSelect={doUsageSelect}
      />
      <div class="aux-data">
        {#if 使用期限年月日}
          <div on:click={doExpirationDate} class="cursor-pointer">
            有効期限：{onshiDateToSqlDate(使用期限年月日)}
          </div>
        {/if}
        {#if 備考レコード.length > 0}
          <div class="frame-with-label cursor-pointer" on:click={doEditBikou}>
            <div class="label">備考</div>
            {#each 備考レコード as rec (rec.id)}
              <div>{rec.備考}</div>
            {/each}
          </div>
        {/if}
        {#if 提供診療情報レコード.length > 0 || 検査値データ等レコード.length > 0}
          <div class="frame-with-label cursur-pointer">
            <div class="label">情報提供</div>
            <div class="cursor-pointer" on:click={doEditInfoProviders}>
              {#each 提供診療情報レコード as rec (rec.id)}
                <div>
                  {#if rec.薬品名称}{rec.薬品名称}：{/if}{rec.コメント}
                </div>
              {/each}
            </div>
            <div class="cursor-pointer" on:click={doEditKensa}>
              {#each 検査値データ等レコード as rec (rec.id)}
                <div>{rec.検査値データ等}</div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
    <div class="form" bind:this={formElement}></div>
  </div>
</Dialog2>

<style>
  .aux-menu-panel {
    margin: 10px 0;
  }

  .upper {
    width: 760px;
    height: 600px;
    display: grid;
    grid-template-columns: 50% 1fr;
    gap: 10px;
    padding: 10px;
    overflow-y: auto;
  }

  .aux-menu {
    margin: 10px 0;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .frame-with-label {
    border: 1px solid #ccc;
    padding: 20px 6px 6px 6px;
    margin: 14px 0 10px 0;
    position: relative;
  }

  .frame-with-label .label {
    position: absolute;
    left: 6px;
    top: -0.6em;
    background-color: white;
    padding: 2px 6px 0 6px;
    border: 1px solid #ccc;
  }
</style>
