<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  // import SearchArea from "./SearchArea.svelte";
  // import { emptyDrugPrefab, type DrugPrefab } from "@/lib/drug-prefab";
  // import EditPrefab from "@/lib/denshi-editor/components/EditPrefab.svelte";
  // import { DateWrapper } from "myclinic-util";
  // import { KouhiSet } from "@/lib/denshi-editor/kouhi-set";
  // import { cache } from "@/lib/cache";
  import DrugPrefabForm from "@/lib/drug-prefab-dialog/DrugPrefabForm.svelte";
  
  export let isVisible: boolean;
  // let list: DrugPrefab[] = [];
  // let editArea: HTMLElement;

  // initList();

  // async function initList() {
  //   list = await cache.getDrugPrefabList();
  // }

  // function doSelect(value: DrugPrefab) {
  //   const at = DateWrapper.fromDate(new Date()).asSqlDate();
  //   const d: EditPrefab = new EditPrefab({
  //     target: editArea,
  //     props: {
  //       prefab: value,
  //       at: at,
  //       kouhiSet: KouhiSet.createEmpty(),
  //       onCancel: function (): void {
  //         d.$destroy();
  //       },
  //       onEnter: function (): void {
  //         d.$destroy();
  //         list = list;
  //       },
  //       onDelete: function(): void {
  //         d.$destroy();
  //         list = list.filter(p => p.id !== value.id );
  //         list = list;
  //       }
  //     }
  //   })
  // }

  // function doNew() {
  //   const prefab = emptyDrugPrefab();
  //   const at = DateWrapper.fromDate(new Date()).asSqlDate();
  //   const d: EditPrefab = new EditPrefab({
  //     target: editArea,
  //     props: {
  //       prefab: prefab,
  //       at: at,
  //       kouhiSet: KouhiSet.createEmpty(),
  //       onCancel: function (): void {
  //         d.$destroy();
  //       },
  //       onEnter: function (): void {
  //         d.$destroy();
  //         list.push(prefab);
  //         list = list;
  //       },
  //       onDelete: function(): void {
  //         d.$destroy();
  //       }
  //     }
  //   })
  // }

  // async function doSave() {
  //   await cache.setDrugPrefabList(list);
  //   alert("drug-prefab-list として保存しました。");
  // }

  // function doClose() {
  //   isVisible = false;
  // }

  // async function doReload() {
  //   list = await cache.reloadDrugPrefabList();
  // }

</script>

{#if isVisible}
  <ServiceHeader title="処方例管理" />
  <DrugPrefabForm destroy={() => isVisible = false} />
{/if}

<!-- <style>
  .top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
  }

  .commands {
    margin-bottom: 10px;
  }
</style> -->
