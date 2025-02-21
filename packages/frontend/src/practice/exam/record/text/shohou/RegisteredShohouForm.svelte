<script lang="ts">
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";

  export let shohou: PrescInfoData;
  export let onCancel: () => void;
</script>

<div style="border:1px solid blue;padding:10px;border-radius:6px">
  <DenshiShohouDisp {shohou} />
</div>
<div style="margin-top:6px;">
  <a href="javascript:void(0)" on:click={onCancel}>キャンセル</a>
</div>
