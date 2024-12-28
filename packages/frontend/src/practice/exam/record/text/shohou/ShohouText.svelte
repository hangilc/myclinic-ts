<script lang="ts">
  import { Text, type Visit } from "myclinic-model";
  import { TextMemoWrapper, type ShohouTextMemo } from "../text-memo";
  import api from "@/lib/api";
  import {
    shohouHikaeFilename,
  } from "@/lib/denshi-shohou/presc-api";
  import type {
    PrescInfoData,
  } from "@/lib/denshi-shohou/presc-info";
  import {
    currentVisitId,
    getCopyTarget,
    tempVisitId,
  } from "@/practice/exam/exam-vars";
  import { initPrescInfoDataFromVisitId } from "@/lib/denshi-shohou/visit-shohou";
  import DenshiShohouDisp from "@/lib/denshi-shohou/disp/DenshiShohouDisp.svelte";
  import RegisteredShohouDialog from "@/lib/denshi-shohou/RegisteredShohouDialog.svelte";
  import UnregisteredShohouDialog from "@/lib/denshi-shohou/UnregisteredShohouDialog.svelte";
  import type { Unsubscriber } from "svelte/store";
  import { textUpdated } from "@/app-events";
  import { onDestroy } from "svelte";
  import ShohouDetail from "./ShohouDetail.svelte";

  export let memo: ShohouTextMemo;
  export let textId: number;
  export let visitId: number;
  let shohou: PrescInfoData = memo.shohou;
  let prescriptionId: string | undefined = memo.prescriptionId;
  let showDetail = false;
  let targetVisitId: number | undefined = undefined;

  let unsubs: Unsubscriber[] = [
    textUpdated.subscribe((updated) => {
      if (updated && updated.textId === textId) {
        const newMemo = TextMemoWrapper.fromText(updated).probeShohouMemo();
        if (newMemo) {
          memo = newMemo;
          shohou = memo.shohou;
          prescriptionId = memo.prescriptionId;
        }
      }
    }),
    currentVisitId.subscribe(
      () => (targetVisitId = getCopyTarget() ?? undefined)
    ),
    tempVisitId.subscribe(() => (targetVisitId = getCopyTarget() ?? undefined)),
  ];

  onDestroy(() => unsubs.forEach((f) => f()));

  async function doClick() {
    if (shohou.引換番号 && prescriptionId) {
      const d: RegisteredShohouDialog = new RegisteredShohouDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          shohou,
          textId,
          prescriptionId,
          onUnregistered,
        },
      });
    } else if (shohou.引換番号 == undefined && prescriptionId == undefined) {
      const text = await api.getText(textId);
      const visit = await api.getVisit(text.visitId);
      const d: UnregisteredShohouDialog = new UnregisteredShohouDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          shohou,
          onDelete: destroyThisText,
          title: "未登録処方編集",
          at: visit.visitedAt.substring(0, 10),
          onSave: saveMemo,
          onRegistered: async (shohou, prescriptionId) => {
            const text = await api.getText(textId);
            TextMemoWrapper.setTextMemo(text, {
              kind: "shohou",
              shohou,
              prescriptionId,
            });
            await api.updateText(text);
          },
        },
      });
    }
  }

  async function saveMemo(shohou: PrescInfoData) {
    const text = await api.getText(textId);
    TextMemoWrapper.setTextMemo(text, {
      kind: "shohou",
      shohou,
      prescriptionId: undefined,
    });
    await api.updateText(text);
  }

  async function destroyThisText() {
    await api.deleteText(textId);
  }

  async function doDelete() {
    if (!confirm("この処方を削除していいですか？")) {
      return;
    }
    await destroyThisText();
  }

  async function onUnregistered() {
    const text = await api.getText(textId);
    const newMemo = TextMemoWrapper.fromText(text).probeShohouMemo();
    if (!newMemo) {
      throw new Error("no text memo for shohousen");
    }
    memo = newMemo;
    shohou = memo.shohou;
    prescriptionId = memo.prescriptionId;
  }

  async function doHikae() {
    if (memo?.prescriptionId) {
      let filename = shohouHikaeFilename(memo?.prescriptionId);
      let url = api.portalTmpFileUrl(filename);
      window.open(url, "_blank");
    }
  }

  function toggleShowDetail() {
    showDetail = !showDetail;
  }

  async function doCopy() {
    if (targetVisitId) {
      const shohou = memo.shohou;
      const drugs = shohou.RP剤情報グループ;
      console.log("shohou", JSON.stringify(drugs, undefined, 2));
      const newShohou = await initPrescInfoDataFromVisitId(targetVisitId);
      Object.assign(newShohou, {
        RP剤情報グループ: [...shohou.RP剤情報グループ],
        備考レコード: shohou.備考レコード,
        提供情報レコード: shohou.提供情報レコード,
      })
      const newText = new Text(
        0,
        targetVisitId,
        "",
        JSON.stringify({
          kind: "shohou",
          shohou: newShohou,
        })
      );
      await api.enterText(newText);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <div on:click={doClick} style="cursor:pointer;">
    <DenshiShohouDisp {shohou} />
  </div>
  <div>
    {#if shohou.引換番号}
      引換番号：{shohou.引換番号}
      {#if memo?.prescriptionId}
        <a href="javascript:void(0)" on:click={doHikae}>控え</a>
        <a href="javascript:void(0)" on:click={toggleShowDetail}>詳細</a>
      {/if}
    {:else}
      <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    {#if targetVisitId && targetVisitId !== visitId}
      <a href="javascript:void(0)" on:click={doCopy}>コピー</a>
    {/if}
  </div>
  {#if showDetail && prescriptionId}<ShohouDetail {prescriptionId} />{/if}
</div>
