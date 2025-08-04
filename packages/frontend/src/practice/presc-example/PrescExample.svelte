<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import SearchArea from "./SearchArea.svelte";
  import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import EditArea from "./EditArea.svelte";

  let editArea: HTMLElement;

  function doSelect(group: RP剤情報, drug: 薬品情報) {
    const e: EditArea = new EditArea({
      target: editArea,
      props: {
        destroy: () => e.$destroy(),
        group,
        drug,
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