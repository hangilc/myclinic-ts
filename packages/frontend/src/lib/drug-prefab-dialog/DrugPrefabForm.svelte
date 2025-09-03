<script lang="ts">
  import { cache } from "@/lib/cache";
  import SearchArea from "./SearchArea.svelte";
  import { DateWrapper } from "myclinic-util";
  import EditPrefab from "@/lib/denshi-editor/components/EditPrefab.svelte";
  import { KouhiSet } from "@/lib/denshi-editor/kouhi-set";
  import { emptyDrugPrefab, type DrugPrefab } from "@/lib/drug-prefab";

  export let destroy: () => void;

  let list: DrugPrefab[] = [];
  let editArea: HTMLElement;

  initList();

  async function initList() {
    list = await cache.getDrugPrefabList();
  }

  function doSelect(value: DrugPrefab) {
    const at = DateWrapper.fromDate(new Date()).asSqlDate();
    const d: EditPrefab = new EditPrefab({
      target: editArea,
      props: {
        prefab: value,
        at: at,
        kouhiSet: KouhiSet.createEmpty(),
        onCancel: function (): void {
          d.$destroy();
        },
        onEnter: function (): void {
          d.$destroy();
          list = list;
        },
        onDelete: function (): void {
          d.$destroy();
          list = list.filter((p) => p.id !== value.id);
          list = list;
        },
      },
    });
  }

  function doNew() {
    const prefab = emptyDrugPrefab();
    const at = DateWrapper.fromDate(new Date()).asSqlDate();
    const d: EditPrefab = new EditPrefab({
      target: editArea,
      props: {
        prefab: prefab,
        at: at,
        kouhiSet: KouhiSet.createEmpty(),
        onCancel: function (): void {
          d.$destroy();
        },
        onEnter: function (): void {
          d.$destroy();
          list.push(prefab);
          list = list;
        },
        onDelete: function (): void {
          d.$destroy();
        },
      },
    });
  }

  async function doSave() {
    await cache.setDrugPrefabList(list);
    alert("drug-prefab-list として保存しました。");
  }

  function doClose() {
    destroy();
  }

  async function doReload() {
    list = await cache.reloadDrugPrefabList();
  }
</script>

<div class="top">
  <div>
    <div class="commands">
      <button on:click={doNew}>新規</button>
      <button on:click={doSave}>保存</button>
      <button on:click={doClose}>閉じる</button>
      <button on:click={doReload}>リロード</button>
    </div>
    <SearchArea onSelect={doSelect} {list} />
  </div>
  <div bind:this={editArea}></div>
</div>

<style>
  .top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    width: var(--drug-prefab-form-width, auto)
  }

  .commands {
    margin-bottom: 10px;
  }
</style>
