<script lang="ts">
  import { Text, type Visit } from "myclinic-model";
  import type { ShohouTextMemo } from "../text-memo";
  import {
    renderDrug,
    type RenderedDrug,
  } from "@/lib/denshi-shohou/presc-renderer";
  import api from "@/lib/api";
  import {
    prescStatus,
    shohouHikaeFilename,
  } from "@/lib/denshi-shohou/presc-api";
  import DenshiShohouDialog from "@/lib/denshi-shohou/DenshiShohouDialog.svelte";
  import { cache } from "@lib/cache";
  import type { StatusResult } from "@/lib/denshi-shohou/shohou-interface";
  import type { 備考レコード } from "@/lib/denshi-shohou/presc-info";
  import * as Base64 from "js-base64";
  import { XMLParser } from "fast-xml-parser";
  import { getCopyTarget } from "@/practice/exam/exam-vars";
  import { initPrescInfoDataFromVisitId } from "@/lib/denshi-shohou/visit-shohou";

  export let text: Text;

  let memo: ShohouTextMemo | undefined = undefined;
  let drugs: RenderedDrug[] = [];
  let bikou: 備考レコード[] = [];
  let accessCode: string | undefined = undefined;
  let prescriptionId: string | undefined = undefined;
  let showDetail = false;
  let statusResult: StatusResult | undefined = undefined;

  $: adaptToText(text);
  $: if (!showDetail) {
    statusResult = undefined;
  }

  function adaptToText(t: Text) {
    if (t && t.memo) {
      let m: ShohouTextMemo = JSON.parse(t.memo);
      memo = m;
      drugs = m.shohou.RP剤情報グループ.map((group) => renderDrug(group));
      bikou = m.shohou.備考レコード ?? [];
      accessCode = m.shohou.引換番号;
      prescriptionId = m.prescriptionId;
      showDetail = false;
    }
  }

  async function doDispClick() {
    if (memo) {
      const visit = await api.getVisit(text.visitId);
      const patient = await api.getPatient(visit.patientId);
      const hokenInfo = await api.getHokenInfoForVisit(visit.visitId);
      const d: DenshiShohouDialog = new DenshiShohouDialog({
        target: document.body,
        props: {
          patient,
          visit,
          hokenInfo,
          shohou: memo.shohou,
          prescriptionId: memo.prescriptionId,
          destroy: () => d.$destroy(),
          textId: text.textId,
        },
      });
    }
  }

  // async function doPrint() {
  //   const qrcode = await createQrCode(createQrCodeContent(memo.shohou));
  //   let data = create_data_from_denshi(memo.shohou);
  //   let ops = drawShohousen(data);
  //   const d: DrawerDialog = new DrawerDialog({
  //     target: document.body,
  //     props: {
  //       destroy: () => d.$destroy(),
  //       ops,
  //       width: 148,
  //       height: 210,
  //       scale: 3,
  //       kind: "shohousen",
  //       title: "処方箋印刷",
  //       stamp: qrcode,
  //       stampStyle:
  //         "position:absolute;left:90mm;top:3mm;height:15mm;width:15mm;",
  //       stampPrintOption: { left: 115, top: 188, width: 15, height: 15 },
  //     },
  //   });
  // }

  async function doHikae() {
    if (memo?.prescriptionId) {
      let filename = shohouHikaeFilename(memo?.prescriptionId);
      let url = api.portalTmpFileUrl(filename);
      window.open(url, "_blank");
    }
  }

  async function doDelete() {
    if (!confirm("この処方を削除していいですか？")) {
      return;
    }
    await api.deleteText(text.textId);
  }

  function toggleShowDetail() {
    showDetail = !showDetail;
  }

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

  async function doCopy() {
    if (memo) {
      const targetVisitId = getCopyTarget();
      if (targetVisitId) {
        const shohou = memo.shohou;
        const drugs = shohou.RP剤情報グループ;
        console.log("shohou", JSON.stringify(drugs, undefined, 2));
        const newShohou = await initPrescInfoDataFromVisitId(targetVisitId);
        newShohou.RP剤情報グループ = drugs;
        const newText = new Text(0, targetVisitId, "", JSON.stringify({
          kind: "shohou",
          shohou: newShohou,
        }));
        await api.enterText(newText);
      }
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="top">
  <div class="disp" on:click={doDispClick}>
    <div>院外処方</div>
    <div>Ｒｐ）</div>
    <div class="drug-render">
      {#each drugs as drug, i}
        <div>{i + 1})</div>
        <div>
          {#each drug.drugs as d}
            <div>{d}</div>
          {/each}
          <div>{drug.usage} {drug.times}</div>
        </div>
      {/each}
    </div>
    <div>
      {#each bikou as b}
        <div>{b.備考}</div>
      {/each}
    </div>
  </div>
  <div>
    {#if accessCode}
      引換番号：{accessCode}
      {#if memo?.prescriptionId}
        <a href="javascript:void(0)" on:click={doHikae}>控え</a>
        <a href="javascript:void(0)" on:click={toggleShowDetail}>詳細</a>
      {/if}
    {:else}
      <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    <a href="javascript:void(0)" on:click={doCopy}>コピー</a>
  </div>
  {#if showDetail}
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
  {/if}
</div>

<style>
  .disp {
    cursor: pointer;
  }
  .drug-render {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
</style>
