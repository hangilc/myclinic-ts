<script lang="ts">
  import api from "@/lib/api";
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import {
  prescStatus,
    shohouHikaeFilename,
    unregisterPresc,
  } from "@/lib/denshi-shohou/presc-api";
  import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import ShohouDetail from "./ShohouDetail.svelte";
  import { cache } from "@/lib/cache";
  import { TextMemoWrapper } from "../text-memo";

  export let shohou: PrescInfoData;
  export let prescriptionId: string;
  export let onCancel: () => void;
  export let onUnregistered: () => void;
  let showDetail = false;

  async function doHikae() {
    let filename = shohouHikaeFilename(prescriptionId);
    let url = api.portalTmpFileUrl(filename);
    window.open(url, "_blank");
  }

  function doStatus() {
    showDetail = !showDetail;
  }

  async function doUnregister() {
    if (!confirm("この処方の発行を取消ていいですか？")) {
      return;
    }
    const kikancode = await cache.getShohouKikancode();
    const result = await unregisterPresc(kikancode, prescriptionId);
    if (
      result.XmlMsg.MessageHeader.SegmentOfResult === "1" &&
      result.XmlMsg.MessageBody.ProcessingResultStatus === "1"
    ) {
      shohou.引換番号 = undefined;
      onUnregistered();
      return;
    }
    if (
      result.XmlMsg.MessageHeader.SegmentOfResult === "1" &&
      result.XmlMsg.MessageBody.ProcessingResultStatus === "2" &&
      result.XmlMsg.MessageBody.ProcessingResultCode === "EPSB1032W"
    ) {
      const status = await prescStatus(kikancode, prescriptionId);
      if (
        status.XmlMsg.MessageBody.PrescriptionStatus ===
        "当該処方箋は処方箋取消されています。"
      ) {
        shohou.引換番号 = undefined;
        onCancel();
        return;
      }
    }
    let msg =
      result.XmlMsg.MessageHeader.ErrorMessage ||
      result.XmlMsg.MessageBody.ProcessingResultMessage;
    alert(`エラー：${msg}`);
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
  <a href="javascript:void(0)" on:click={doUnregister}>発行取消</a>
  <a href="javascript:void(0)" on:click={onCancel}>キャンセル</a>
</div>
