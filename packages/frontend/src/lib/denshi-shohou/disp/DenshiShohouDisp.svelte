<script lang="ts">
  import type { PrescInfoData } from "../presc-info";
  import GroupsDisp from "./GroupsDisp.svelte";

  export let shohou: PrescInfoData;
</script>

<div>
  <div>院外処方</div>
  <div>Ｒｐ）</div>
  <GroupsDisp groups={shohou.RP剤情報グループ} />
  {#if shohou.引換番号}引換番号：{shohou.引換番号}{/if}
</div>