<script lang="ts">
  import { DateWrapper } from "myclinic-util";
  import type { PrescInfoData } from "../presc-info";
  import GroupsDisp from "./GroupsDisp.svelte";

  export let shohou: PrescInfoData;
</script>

<div>
  <div>院外処方</div>
  <div>Ｒｐ）</div>
  <GroupsDisp groups={shohou.RP剤情報グループ} />
  {#each shohou.備考レコード ?? [] as rec}
    <div>備考：{rec.備考}</div>
  {/each}
  {#if shohou.使用期限年月日}
    <div>使用期限：{DateWrapper.fromOnshiDate(shohou.使用期限年月日).render(d => `${d.getYear()}年${d.getMonth()}月${d.getDay()}日（${d.getYoubi()}）`)}</div>
  {/if}
</div>