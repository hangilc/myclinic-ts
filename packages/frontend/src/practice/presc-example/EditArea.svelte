<script lang="ts">
  import EditDrug from "@/lib/denshi-editor/components/EditDrug.svelte";
  import type {
    RP剤情報Edit,
  } from "@/lib/denshi-editor/denshi-edit";
  import { DateWrapper } from "myclinic-util";

  export let destroy: () => void;
  export let group: RP剤情報Edit;
  export let drugId: number;
  export let onChange: () => void;
  export let onCancel: () => void;
  let at = DateWrapper.fromDate(new Date()).asSqlDate();

</script>

<div class="title">処方例編集</div>
<EditDrug data={group} {drugId} {at} onChange={onChange} onCancel={onCancel} {destroy} />

<style>
</style>
