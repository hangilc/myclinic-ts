<script lang="ts">
  import EditDrug from "@/lib/denshi-editor/components/EditDrug.svelte";
  import EditGroup from "@/lib/denshi-editor/components/EditGroup.svelte";
  import type { RP剤情報Edit, 薬品情報Edit } from "@/lib/denshi-editor/denshi-edit";
  import { KouhiSet } from "@/lib/denshi-editor/kouhi-set";
  import { DateWrapper } from "myclinic-util";

  export let destroy: () => void;
  export let group: RP剤情報Edit;
  export let drug: 薬品情報Edit;
  export let onChange: () => void;
  export let onCancel: () => void;
  let at = DateWrapper.fromDate(new Date()).asSqlDate();
</script>

<div class="title">処方例編集</div>
<EditGroup
  group={group}
  {drug}
  {at}
  {onChange}
  {onCancel}
  {destroy}
  kouhiSet={KouhiSet.createEmpty()}
/>

<style>
</style>
