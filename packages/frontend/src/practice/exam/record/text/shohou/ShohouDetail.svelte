<script lang="ts">
  import { cache } from "@/lib/cache";
  import { prescStatus } from "@/lib/denshi-shohou/presc-api";
  import type { StatusResult } from "@/lib/denshi-shohou/shohou-interface";
  import * as Base64 from "js-base64";
  import { XMLParser } from "fast-xml-parser";

  export let prescriptionId: string;
  let statusResult: StatusResult | undefined = undefined;

  async function doStatus() {
    if (prescriptionId) {
      const kikancode = await cache.getShohouKikancode();
      statusResult = await prescStatus(kikancode, prescriptionId);
    }
  }

  function formatDispensingResult(json: string | undefined): string {
    if (!json) {
      return "";
    } else {
      const decoded = Base64.decode(json);
      const parser = new XMLParser({});
      const parsed = parser.parse(decoded);
      const dispensDoc = parsed.Document?.Dispensing?.DispensingDocument;
      if (dispensDoc) {
        const dispensDocDecoded = Base64.decode(dispensDoc);
        return dispensDocDecoded;
      }
      return "";
    }
  }
</script>

<div
  style="margin:10px 0;border:1px solid gray;border-radius:4px;padding:10px;"
>
  <div>処方ＩＤ：{prescriptionId}</div>
  <div>
    <a href="javascript:void(0)" on:click={doStatus}>処理状況</a>
  </div>
  {#if statusResult}
    <div>
      <div>{statusResult.XmlMsg.MessageBody.PrescriptionStatus}</div>
      {#if statusResult.XmlMsg.MessageBody.ReceptionPharmacyName}
        <div>
          {statusResult.XmlMsg.MessageBody.ReceptionPharmacyName}
          {#if statusResult.XmlMsg.MessageBody.ReceptionPharmacyCode}
            （{statusResult.XmlMsg.MessageBody.ReceptionPharmacyCode}）
          {/if}
        </div>
        <div>
          {statusResult.XmlMsg.MessageBody.MessageFlg === "2"
            ? "伝達事項あり"
            : ""}
          <pre style="white-space:pre-wrap">{formatDispensingResult(
              statusResult.XmlMsg.MessageBody.DispensingResult
            )}</pre>
        </div>
      {/if}
    </div>
  {/if}
</div>
