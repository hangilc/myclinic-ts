<script lang="ts">
  import api from "@/lib/api";
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import { shohouHikaeFilename } from "@/lib/denshi-shohou/presc-api";
  import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import UnregisteredShohouDialog from "@/lib/denshi-shohou/UnregisteredShohouDialog.svelte";

  export let shohou: PrescInfoData;
  export let prescriptionId: string;
  export let onCancel: () => void;

  async function doHikae() {
    let filename = shohouHikaeFilename(prescriptionId);
    let url = api.portalTmpFileUrl(filename);
    window.open(url, "_blank");
  }

</script>

<div style="border:1px solid blue;padding:10px;border-radius:6px">
  <DenshiShohouDisp {shohou} {prescriptionId} />
</div>
<div style="margin-top:6px;">
  <a href="javascript:void(0)" on:click={doHikae}>控え</a>
  <a href="javascript:void(0)" on:click={onCancel}>キャンセル</a>
</div>
