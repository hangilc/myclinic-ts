<script lang="ts">
  import EditDrug from "@/lib/denshi-editor/components/EditDrug.svelte";
  import type {
    RP剤情報Edit,
    薬品情報Edit,
  } from "@/lib/denshi-editor/denshi-edit";
  import { DateWrapper } from "myclinic-util";

  export let destroy: () => void;
  export let group: RP剤情報Edit;
  export let drugId: number;
  let drug: 薬品情報Edit = group.getDrugById(drugId);
  let at = DateWrapper.fromDate(new Date()).asSqlDate();

  function doChange(value: RP剤情報Edit) {

  }
</script>

<div class="title">処方例編集</div>
<EditDrug group={group} drugId={drugId} {at} onChange={doChange} destroy={destroy}/>

<style>
</style>
