<script lang="ts">
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
</div>