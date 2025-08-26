<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import SearchArea from "./SearchArea.svelte";
  import EditArea from "./EditArea.svelte";
  import { RP剤情報Edit } from "@/lib/denshi-editor/denshi-edit";
  import {
    createPrescExampleData,
    type PrescExampleData,
  } from "./presc-example-data";
  import { cache } from "@/lib/cache";
  import { createSingleDrugRP剤情報 } from "./presc-example-helper";
  
  export let isVisible: boolean;
  let list: PrescExampleData[] = [];

  let editArea: HTMLElement;

  load();

  async function load() {
    list = (await cache.getPrescExample()).map(createPrescExampleData);
  }

  function doSelect(data: PrescExampleData, drugIndex: number) {
    const groupEdit = RP剤情報Edit.fromObject(data.data);
    const drug = groupEdit.薬品情報グループ[drugIndex];
    if( !drug ){
      return;
    }
    const e: EditArea = new EditArea({
      target: editArea,
      props: {
        destroy: () => e.$destroy(),
        group: groupEdit,
        drug,
        onChange: () => {
          if (groupEdit.薬品情報グループ.length === 0) {
            list = list.filter((e) => e.id !== data.id);
          } else {
            // data.data = Object.assign({}, groupEdit.toObject(), { comment: data.data.comment });
            // list = list;
          }
        },
        onCancel: () => {},
      },
    });
  }

  async function doSave() {
    await cache.setPrescExample(list.map((e) => e.data));
  }

  function doAdd() {
    const group = RP剤情報Edit.fromObject(createSingleDrugRP剤情報());
    const f: EditArea = new EditArea({
      target: editArea,
      props: {
        destroy: () => f.$destroy(),
        group: group,
        drugId: group.薬品情報グループ[0].id,
        onChange: () => {
          if( group.薬品情報グループ.length === 0 ){
            return;
          }
          // let ex = createPrescExampleData(group);
          // list.push(ex);
          list = list;
        },
        onCancel: () => {
          f.$destroy();
        }
      },
    });
  }

  async function doCancel() {
    await load();
  }
</script>

{#if isVisible}
  <ServiceHeader title="処方例管理" />
  <div class="top">
    <div>
      <div class="commands">
        <button on:click={doAdd}>新規</button>
        <button on:click={doSave}>保存</button>
        <button on:click={doCancel}>キャンセル</button>
      </div>
      <SearchArea onSelect={doSelect} {list} />
    </div>
    <div bind:this={editArea}></div>
  </div>
{/if}

<style>
  .top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
  }

  .commands {
    margin-bottom: 10px;
  }
</style>
