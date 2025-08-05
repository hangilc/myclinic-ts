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
  export let onChange: () => void;
  let at = DateWrapper.fromDate(new Date()).asSqlDate();

  function doChange(_value: RP剤情報Edit) {
    onChange();
  }
</script>

<div class="title">処方例編集</div>
<EditDrug {group} {drugId} {at} onChange={doChange} {destroy} />

<style>
</style>
