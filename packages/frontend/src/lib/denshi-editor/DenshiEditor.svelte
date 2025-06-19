<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type {
    PrescInfoData,
    提供診療情報レコード,
    薬品情報,
    検査値データ等レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import PrescRep from "./PrescRep.svelte";
  import NewDrug from "./NewDrug.svelte";
  import {
    indexRP剤情報,
    index提供診療情報レコード,
    index検査値データ等レコード,
    index用法補足レコード,
    index薬品情報,
    unindexRP剤情報,
    unindex提供診療情報レコード,
    unindex検査値データ等レコード,
    unindex薬品情報,
    type RP剤情報Indexed,
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

  export let destroy: () => void;
  export let data: PrescInfoData;
  export let onEnter: (shohou: PrescInfoData) => void;
  let formElement: HTMLElement;
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
  ).map((r) => index検査値データ等レコード(r));

  function doEnter() {
    let shohou: PrescInfoData = Object.assign({}, data, {
      RP剤情報グループ: groups.map(unindexRP剤情報),
      使用期限年月日,
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

  function shohouDateToSqlDate(shohouDate: string): string {
    let y = shohouDate.substring(0, 4);
    let m = shohouDate.substring(4, 6);
    let d = shohouDate.substring(6, 8);
    return `${y}-${m}-${d}`;
  }

  function doAddDrug(group: RP剤情報Indexed) {
    clearForm();
    const e: NewDrug = new NewDrug({
      target: formElement,
      props: {
        at,
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onEnter: (drug) => {
          group.薬品情報グループ.push(index薬品情報(drug));
          groups = groups;
        },
      },
    });
    clearForm = () => e.$destroy();
  }

  function doDrugSelect(group: RP剤情報Indexed, drug: 薬品情報Indexed) {
    clearForm();
    const e: EditDrug = new EditDrug({
      target: formElement,
      props: {
        at,
        drug: unindex薬品情報(drug),
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
  }

  function doUsageSelect(group: RP剤情報Indexed) {
    clearForm();
    const e: GroupForm = new GroupForm({
      target: formElement,
      props: {
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        onDelete: () => {
          groups = groups.filter((g) => g.id !== group.id);
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
            console.log("groups", groups);
          }
        },
      },
    });
    clearForm = () => e.$destroy();
  }

  function doAddGroup() {
    clearForm();
    const e: NewGroup = new NewGroup({
      target: formElement,
      props: {
        onDone: () => {
          clearForm();
          clearForm = () => {};
        },
        at,
        onEnter: (group) => {
          groups.push(indexRP剤情報(group));
          groups = groups;
        },
      },
    });
    clearForm = () => e.$destroy();
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
          })
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
</script>

<Dialog2 title="電子処方箋編集" {destroy}>
  <div class="upper">
    <div>
      <div class="aux-menu">
        <button on:click={doAddGroup}>追加</button>
        {#if !使用期限年月日}
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a
            href="javascript:void(0)"
            class="small-link"
            on:click={doExpirationDate}>有効期限</a
          >
        {/if}
        {#if showAuxMenu === false}
          <ChevronDownLink onClick={() => (showAuxMenu = true)} />
        {:else}
          <ChevronUpLink onClick={() => (showAuxMenu = false)} />
        {/if}
        {#if showAuxMenu}
          <div>
            <a
              href="javascript:void(0)"
              class="small-link"
              on:click={doAddInfoProvider}
            >
              情報提供
            </a>
          </div>
        {/if}
      </div>
      <PrescRep
        {groups}
        onAddDrug={doAddDrug}
        onDrugSelect={doDrugSelect}
        onUsageSelect={doUsageSelect}
      />
      <div class="aux-data">
        {#if 使用期限年月日}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div on:click={doExpirationDate} class="cursor-pointer">
            有効期限：{onshiDateToSqlDate(使用期限年月日)}
          </div>
        {/if}
        <!-- svelte-ignore missing-declaration -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click={doEditInfoProviders} class="cursor-pointer">
          {#each 提供診療情報レコード as rec (rec.id)}
            <div>
              {#if rec.薬品名称}
                <span class="drug-name">{rec.薬品名称}</span>：
              {/if}
              {rec.コメント}
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="form" bind:this={formElement}></div>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog2>

<style>
  .upper {
    width: 500px;
    height: 600px;
    display: grid;
    grid-template-columns: 30% 1fr;
    gap: 10px;
    padding: 10px;
    overflow-y: auto;
  }

  .aux-menu {
    margin: 10px 0;
  }

  .small-link {
    font-size: 14px;
  }

  .commands {
    margin: 10px;
    text-align: right;
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
