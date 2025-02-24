<script lang="ts">
  import api from "@/lib/api";
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import { shohouHikaeFilename } from "@/lib/denshi-shohou/presc-api";
  import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import ShohouDetail from "./ShohouDetail.svelte";

  export let shohou: PrescInfoData;
  export let prescriptionId: string;
  export let onCancel: () => void;
  let showDetail = false;

  async function doHikae() {
    let filename = shohouHikaeFilename(prescriptionId);
    let url = api.portalTmpFileUrl(filename);
    window.open(url, "_blank");
  }

  function doStatus() {
    showDetail = !showDetail;
  }

</script>

<div style="border:1px solid blue;padding:10px;border-radius:6px">
  <DenshiShohouDisp {shohou} {prescriptionId} />
</div>
{#if showDetail}
  <ShohouDetail {prescriptionId} />
{/if}
<div style="margin-top:6px;">
  <a href="javascript:void(0)" on:click={doHikae}>控え</a>
  <a href="javascript:void(0)" on:click={doStatus}>状態</a>
  <a href="javascript:void(0)" on:click={onCancel}>キャンセル</a>
</div>
