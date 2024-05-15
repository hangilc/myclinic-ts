<script lang="ts">
  import * as kanjidate from "kanjidate";
  import {
    currentVisitId,
    tempVisitId,
    setTempVisitId,
    clearTempVisitId,
    addToMishuuList,
  } from "../exam-vars";
  import Dialog from "@/lib/Dialog.svelte";
  import api from "@/lib/api";
  import { onDestroy } from "svelte";
  import type { TaskRunner } from "@/lib/unit-task";
  import FutanWariOverrideDialog from "./FutanWariOverrideDialog.svelte";
  import type { VisitEx } from "myclinic-model";
  import { monthOfSqlDate, yearOfSqlDate } from "@/lib/util";
  // import { calcGendogaku } from "@/lib/gendogaku";
  import { popupTrigger } from "@/lib/popup-helper";
  import HokengaiDialog from "./HokengaiDialog.svelte";
  import { type Meisai, MeisaiWrapper, calcRezeptMeisai, totalTenOfMeisaiItems } from "@/lib/rezept-meisai";

  export let visit: VisitEx;

  // let taskRunner: TaskRunner | null = null;
  let showMeisai = false;

  onDestroy(() => {
    // taskRunner?.cancel();
  });

  function doDeleteVisit(): void {
    api.deleteVisit(visit.visitId);
  }

  function doSetTempVisitId(): void {
    setTempVisitId(visit.visitId, alert);
  }

  function doClearTempVisitId(): void {
    clearTempVisitId();
  }

  async function doMeisai() {
    const meisai = await api.getMeisai(visit.visitId);
    showMeisai = true;
  }

  function doFutanwariOverride() {
    const d: FutanWariOverrideDialog = new FutanWariOverrideDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        visit,
      },
    });
  }

  function doMishuuList(): void {
    addToMishuuList(visit);
  }

  function isMishuu(visit: VisitEx): boolean {
    const charge = visit.chargeOption?.charge;
    const pay = visit.lastPayment?.amount;
    return charge != null && charge > 0 && (pay == null || pay === 0);
  }

  function totalTenOf(meisai: Meisai): string {
    // return meisai.totalTen.toLocaleString();
    return totalTenOfMeisaiItems(meisai.items).toLocaleString();
  }

  // async function doGendogaku() {
  //   const year = yearOfSqlDate(visit.visitedAt);
  //   const month = monthOfSqlDate(visit.visitedAt);
  //   const gendogaku = await calcGendogaku(visit.patient.patientId, year, month);
  //   if (!gendogaku) {
  //     alert("限度額を確定できません。");
  //   } else {
  //     alert(`限度額： ${gendogaku.toLocaleString()}円`);
  //   }
  // }

  function doHokengai() {
    const attrs = visit.attributes;
    const hokengai: string[] = attrs?.hokengai ?? [];

    const d: HokengaiDialog = new HokengaiDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        hokengai,
        onEnter: async (entered: string[]) => {
          const newAttr = Object.assign({}, attrs, { hokengai: entered });
          const origVisit = await api.getVisit(visit.visitId);
          origVisit.attributesStore = JSON.stringify(newAttr);
          await api.updateVisit(origVisit);
          visit.attributesStore = origVisit.attributesStore;
        },
      },
    });
  }

  function composeMenu(): [string, () => void][] {
    const m: [string, () => void][] = [];
    function add(label: string, action: () => void) {
      m.push([label, action]);
    }
    add("この診察を削除", doDeleteVisit);
    if (visit.visitId !== $tempVisitId) {
      add("暫定診察に設定", doSetTempVisitId);
    } else {
      add("暫定診察の解除", doClearTempVisitId);
    }
    add("診療明細", doMeisai);
    // add("負担割オーバーライド", doFutanwariOverride);
    if (isMishuu(visit)) {
      add("未収リストへ", doMishuuList);
    }
    // add("限度額", doGendogaku);
    add("保険外", doHokengai);
    return m;
  }
</script>

<div
  class="top"
  class:current={visit.visitId === $currentVisitId}
  class:temp-visit={visit.visitId === $tempVisitId}
>
  <span class="datetime">{kanjidate.format(kanjidate.f9, visit.visitedAt)}</span
  >
  <a href="javascript:void(0)" on:click={popupTrigger(() => composeMenu())}
    >操作</a
  >
  <!-- <div slot="menu" class="popup-menu">
      <a href="javascript:void(0)" on:click={destroyAnd(doDeleteVisit)}
        >この診察を削除</a
      >
      {#if visit.visitId !== $tempVisitId}
        <a
          href="javascript:void(0)"
          on:click={destroyAnd(doSetTempVisitId)}>暫定診察に設定</a
        >
      {:else}
        <a
          href="javascript:void(0)"
          on:click={destroyAnd(doClearTempVisitId)}>暫定診察の解除</a
        >
      {/if}
      <a href="javascript:void(0)" on:click={destroyAnd(doMeisai)}>診療明細</a>
      <a href="javascript:void(0)" on:click={destroyAnd(doFutanwariOverride)}
        >負担割オーバーライド</a
      >
      {#if isMishuu(visit)}
        <a href="javascript:void(0)" on:click={destroyAnd(doMishuuList)}>未収リストへ</a>
      {/if}
      <a href="javascript:void(0)" on:click={destroyAnd(doGendogaku)}>限度額</a>
    </div> -->
</div>

{#if showMeisai}
  <Dialog destroy={() => (showMeisai = false)} title="診療明細">
    <div class="meisai-top">
      <!-- {#await api.getMeisai(visit.visitId) then meisai} -->
      {#await calcRezeptMeisai(visit.visitId) then meisai}
        {@const grouped = new MeisaiWrapper(meisai).getGrouped()}
        {#each grouped.keys() as section}
          <div>
            <div>{section}</div>
            {#each grouped.get(section)?.items ?? [] as entry}
              <div class="meisai-detail-item-row">
                <div class="meisai-detail-item label">{entry.label}</div>
                <div class="meisai-detail-item tanka-count">
                  {entry.ten.toLocaleString()}x{entry.count.toLocaleString()}
                </div>
                <div class="meisai-detail-item subtotal">
                  {(entry.ten * entry.count).toLocaleString()}
                </div>
              </div>
            {/each}
          </div>
        {/each}
        <hr />
        <div class="meisai-detail-summary">
          <span>総点：{totalTenOf(meisai)}点</span>
          <span>負担割：{meisai.futanWari.toLocaleString()}割</span>
          <span>自己負担：{meisai.charge.toLocaleString()}円</span>
        </div>
      {/await}
      <div class="commands">
        <button on:click={() => (showMeisai = false)}>閉じる</button>
      </div>
    </div>
  </Dialog>
{/if}

<style>
  .top {
    padding: 3px 6px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .top.current {
    background-color: #ff9;
  }

  .top.temp-visit {
    background-color: #9ff;
  }

  .datetime {
    font-weight: bold;
  }

  .meisai-detail-item.label {
    max-width: 16em;
  }

  .meisai-detail-item-row {
    margin-left: 1em;
    display: flex;
  }

  .meisai-detail-item {
    display: inline-block;
    width: 100%;
  }

  .meisai-detail-item.tanka-count {
    width: 4em;
    text-align: right;
    margin-right: 4px;
  }

  .meisai-detail-item.subtotal {
    width: 3em;
    text-align: right;
  }

  .meisai-detail-summary span {
    margin-right: 1em;
  }

  .meisai-top {
    margin: 10px;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-bottom: 4px;
    line-height: 1;
  }
</style>
