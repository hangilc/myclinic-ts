<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import SearchArea from "./SearchArea.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import EditArea from "./EditArea.svelte";
  import { RP剤情報Edit } from "@/lib/denshi-editor/denshi-edit";
  import {
    createPrescExampleData,
    type PrescExampleData,
  } from "./presc-example-data";
  import { cache } from "@/lib/cache";

  let list: PrescExampleData[] = [];

  let editArea: HTMLElement;

  load();

  async function load() {
    list = (await cache.getPrescExample()).map(createPrescExampleData);
  }

  function doSelect(group: RP剤情報, drugIndex: number) {
    const groupEdit = RP剤情報Edit.fromObject(group);
    const drugId = groupEdit.薬品情報グループ[drugIndex].id;
    const e: EditArea = new EditArea({
      target: editArea,
      props: {
        destroy: () => e.$destroy(),
        group: groupEdit,
        drugId,
        onChange: () => {},
      },
    });
  }

  async function doSave() {
    await cache.setPrescExample(list.map(e => e.data));
  }

  function doAdd() {
    
  }
</script>

<ServiceHeader title="処方例管理"/>
<div class="top">
  <div>
    <div class="commands">
      <button on:click={doAdd}>追加</button>
      <button on:click={doSave}>保存</button>
    </div>
    <SearchArea onSelect={doSelect} list={list}/>
  </div>
  <div bind:this={editArea}></div>
</div>

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
