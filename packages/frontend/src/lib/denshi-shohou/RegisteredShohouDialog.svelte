<script lang="ts">
  import { TextMemoWrapper } from "@/practice/exam/record/text/text-memo";
  import api from "../api";
  import Dialog from "../Dialog.svelte";
  import DenshiShohouDisp from "./disp/DenshiShohouDisp.svelte";
  import type { PrescInfoData } from "./presc-info";
  import { cache } from "../cache";
  import { prescStatus, unregisterPresc } from "./presc-api";

  export let shohou: PrescInfoData;
  export let prescriptionId: string;
  export let destroy: () => void;
  export let textId: number;
  export let onUnregistered: () => void;

  async function updateTextMemo() {
    let text = await api.getText(textId);
    let shohouMemo = TextMemoWrapper.fromText(text).probeShohouMemo();
    if( shohouMemo == undefined ){
      throw new Error("cannot find shohou memo");
    }
    shohouMemo.shohou = shohou;
    shohouMemo.prescriptionId = undefined;
    if( shohouMemo.shohou.引換番号 != undefined ){
      throw new Error("cannot happen (引換番号)");
    }
    TextMemoWrapper.setTextMemo(text, shohouMemo);
    await api.updateText(text);
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
      await updateTextMemo();
      destroy();
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
        await updateTextMemo();
        destroy();
        onUnregistered();
        return;
      }
    }
    let msg =
      result.XmlMsg.MessageHeader.ErrorMessage ||
      result.XmlMsg.MessageBody.ProcessingResultMessage;
    alert(`エラー：${msg}`);
  }
</script>

<Dialog title="登録済処方" {destroy}>
  <DenshiShohouDisp {shohou} {prescriptionId}/>
  <div class="commands">
    <button on:click={doUnregister}>登録削除</button>
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>

<style>
  .commands {
    margin-top: 10px;
    text-align: right;
  }
</style>
