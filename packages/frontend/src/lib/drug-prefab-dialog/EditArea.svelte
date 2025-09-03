<script lang="ts">
  import EditGroup from "@/lib/denshi-editor/components/EditGroup.svelte";
  import type { RP剤情報Edit, 薬品情報Edit } from "@/lib/denshi-editor/denshi-edit";
  import { KouhiSet } from "@/lib/denshi-editor/kouhi-set";
  import { DateWrapper } from "myclinic-util";

  export let group: RP剤情報Edit;
  export let drug: 薬品情報Edit;
  export let onCancel: () => void;
  let at = DateWrapper.fromDate(new Date()).asSqlDate();

  function onEnter() {}
</script>

<div class="title">処方例編集</div>
<EditGroup
  group={group}
  {drug}
  {at}
  {onEnter}
  {onCancel}
  kouhiSet={KouhiSet.createEmpty()}
/>

<style>
</style>
