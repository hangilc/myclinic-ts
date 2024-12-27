<script lang="ts">
  import { Text, type Visit } from "myclinic-model";
  import { TextMemoWrapper, type ShohouTextMemo } from "../text-memo";
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
  import type {
    PrescInfoData,
    備考レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import * as Base64 from "js-base64";
  import { XMLParser } from "fast-xml-parser";
  import { getCopyTarget } from "@/practice/exam/exam-vars";
  import { initPrescInfoDataFromVisitId } from "@/lib/denshi-shohou/visit-shohou";
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import RegisteredShohouDialog from "@/lib/denshi-shohou/RegisteredShohouDialog.svelte";
  import UnregisteredShohouDialog from "@/lib/denshi-shohou/UnregisteredShohouDialog.svelte";
  import type { Unsubscriber } from "svelte/store";
  import { textUpdated } from "@/app-events";
  import { onDestroy } from "svelte";

  export let memo: ShohouTextMemo;
  export let textId: number;
  let shohou: PrescInfoData = memo.shohou;
  let prescriptionId: string | undefined = memo.prescriptionId;

  let unsubs: Unsubscriber[] = [
    textUpdated.subscribe(updated => {
      if( updated && updated.textId === textId ){
        const newMemo = TextMemoWrapper.fromText(updated).probeShohouMemo();
        if( newMemo ){
          memo = newMemo;
          shohou = memo.shohou;
          prescriptionId = memo.prescriptionId;
        }
      }
    }),
  ];

  onDestroy(() => unsubs.forEach(f => f()));

  async function doClick() {
    if( shohou.引換番号 && prescriptionId ) {
      const d: RegisteredShohouDialog = new RegisteredShohouDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          shohou,
          textId,
          prescriptionId,
          onUnregistered
        }
      })
    } else if( shohou.引換番号 == undefined && prescriptionId == undefined) {
      const text = await api.getText(textId);
      const visit = await api.getVisit(text.visitId);
      const d: UnregisteredShohouDialog = new UnregisteredShohouDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          shohou,
          onDestroy: destroyThisText,
          title: "未登録処方編集",
          at: visit.visitedAt.substring(0, 10),
          onSave: saveMemo,
          onRegistered: async (shohou, prescriptionId) => {
            const text = await api.getText(textId);
            TextMemoWrapper.setTextMemo(text, {
              kind: "shohou", shohou, prescriptionId,
            });
            await api.updateText(text);
          },
        }
      })
    }
  }

  async function saveMemo(shohou: PrescInfoData) {
    const text = await api.getText(textId);
    TextMemoWrapper.setTextMemo(text, {
      kind: "shohou",
      shohou,
      prescriptionId: undefined
    });
    await api.updateText(text);
  }

  async function destroyThisText() {
    await api.deleteText(textId);
  }

  async function onUnregistered() {
    const text = await api.getText(textId);
    const newMemo = TextMemoWrapper.fromText(text).probeShohouMemo();
    if( !newMemo ){
      throw new Error("no text memo for shohousen");
    }
    memo = newMemo;
    shohou = memo.shohou;
    prescriptionId = memo.prescriptionId;
  }

  // let drugs: RenderedDrug[] = [];
  // let bikou: 備考レコード[] = [];
  // let accessCode: string | undefined = undefined;
  // let showDetail = false;
  // let statusResult: StatusResult | undefined = undefined;

  // $: adaptToMemo(memo);
  // $: if (!showDetail) {
  //   statusResult = undefined;
  // }

  // function adaptToMemo(m: ShohouTextMemo) {
  //   drugs = m.shohou.RP剤情報グループ.map((group) => renderDrug(group));
  //   bikou = m.shohou.備考レコード ?? [];
  //   accessCode = m.shohou.引換番号;
  //   prescriptionId = m.prescriptionId;
  //   showDetail = false;
  // }

  // async function doDispClick() {
  //   if (memo) {
  //     const visit = await api.getVisit(text.visitId);
  //     const patient = await api.getPatient(visit.patientId);
  //     const hokenInfo = await api.getHokenInfoForVisit(visit.visitId);
  //     const d: DenshiShohouDialog = new DenshiShohouDialog({
  //       target: document.body,
  //       props: {
  //         patient,
  //         visit,
  //         hokenInfo,
  //         shohou: memo.shohou,
  //         prescriptionId: memo.prescriptionId,
  //         destroy: () => d.$destroy(),
  //         textId: text.textId,
  //       },
  //     });
  //   }
  // }

  // async function doHikae() {
  //   if (memo?.prescriptionId) {
  //     let filename = shohouHikaeFilename(memo?.prescriptionId);
  //     let url = api.portalTmpFileUrl(filename);
  //     window.open(url, "_blank");
  //   }
  // }

  // async function doDelete() {
  //   if (!confirm("この処方を削除していいですか？")) {
  //     return;
  //   }
  //   await api.deleteText(text.textId);
  // }

  // function toggleShowDetail() {
  //   showDetail = !showDetail;
  // }

  // async function doStatus() {
  //   if (prescriptionId) {
  //     const kikancode = await cache.getShohouKikancode();
  //     statusResult = await prescStatus(kikancode, prescriptionId);
  //   }
  // }

  // function formatDispensingResult(json: string | undefined): string {
  //   if (!json) {
  //     return "";
  //   } else {
  //     const decoded = Base64.decode(json);
  //     const parser = new XMLParser({});
  //     const parsed = parser.parse(decoded);
  //     const dispensDoc = parsed.Document?.Dispensing?.DispensingDocument;
  //     if (dispensDoc) {
  //       const dispensDocDecoded = Base64.decode(dispensDoc);
  //       return dispensDocDecoded;
  //     }
  //     return "";
  //   }
  // }

  // async function doCopy() {
  //   if (memo) {
  //     const targetVisitId = getCopyTarget();
  //     if (targetVisitId) {
  //       const shohou = memo.shohou;
  //       const drugs = shohou.RP剤情報グループ;
  //       console.log("shohou", JSON.stringify(drugs, undefined, 2));
  //       const newShohou = await initPrescInfoDataFromVisitId(targetVisitId);
  //       newShohou.RP剤情報グループ = drugs;
  //       const newText = new Text(
  //         0,
  //         targetVisitId,
  //         "",
  //         JSON.stringify({
  //           kind: "shohou",
  //           shohou: newShohou,
  //         })
  //       );
  //       await api.enterText(newText);
  //     }
  //   }
  // }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={doClick} class="top">
  <DenshiShohouDisp {shohou} />
</div>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!--
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
-->

<style>
  .top {
    cursor: pointer;
  }
</style>