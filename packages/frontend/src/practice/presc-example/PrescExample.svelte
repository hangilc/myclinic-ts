<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import SearchArea from "./SearchArea.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import EditArea from "./EditArea.svelte";
  import { RP剤情報Edit } from "@/lib/denshi-editor/denshi-edit";

  let editArea: HTMLElement;

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
      }
    });
  }
</script>

<ServiceHeader title="処方例管理" />
<div class="top">
  <div><SearchArea onSelect={doSelect}/></div>
  <div bind:this={editArea}></div>
</div>

<style>
  .top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
  }
</style>