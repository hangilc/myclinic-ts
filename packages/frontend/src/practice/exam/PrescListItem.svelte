<script lang="ts">
  import { prescStatus } from "@/lib/denshi-shohou/presc-api";
  import type { StatusResult } from "@/lib/denshi-shohou/shohou-interface";
  import * as cache from "@lib/cache";
  import { DateWrapper } from "myclinic-util";

  export let item: {
    PrescriptionId: string;
    AccessCode: string;
    CreateDateTime: string;
  };
  let showStatus = false;
  let status: StatusResult | undefined = undefined;

  async function doToggleShowStatus() {
    if (showStatus) {
      showStatus = false;
      status = undefined;
    } else {
      const kikancode = await cache.getShohouKikancode();
      status = await prescStatus(kikancode, item.PrescriptionId);
      showStatus = true;
    }
  }

  function formatDate(shohouDate: string): string {
    const d = DateWrapper.fromOnshiDate(shohouDate);
    console.log("date", shohouDate, d);
    // return `${d.getGengou()}${d.fmtNen()}年${d.fmtMonth()}月${d.fmtDay()}日`;
    return `${d.getGengou()}${d.getNen()}年${d.getMonth()}月${d.getDay()}日`;
  }
</script>

<div
  style="margin: 10px 0; border: 1px solid gray; border-radius: 4px; padding: 10px;"
>
  <div>処方ＩＤ：{item.PrescriptionId}</div>
  <div>引換番号：{item.AccessCode}</div>
  <div>発行時刻：{formatDate(item.CreateDateTime)}</div>
  <div>
    <a href="javascript:void(0)" on:click={doToggleShowStatus}>処理状況</a>
  </div>
  {#if status}
    <div>{status.XmlMsg.MessageBody.PrescriptionStatus}</div>
    {#if status.XmlMsg.MessageBody.ReceptionPharmacyName}
      <div>
        {status.XmlMsg.MessageBody.ReceptionPharmacyName}
        {#if status.XmlMsg.MessageBody.ReceptionPharmacyCode}
          （{status.XmlMsg.MessageBody.ReceptionPharmacyCode}）
        {/if}
      </div>
      <div>
        {status.XmlMsg.MessageBody.MessageFlg === "2" ? "伝達事項あり" : ""}
        {status.XmlMsg.MessageBody.DispensingResult ?? ""}
      </div>
    {/if}
  {/if}
</div>
