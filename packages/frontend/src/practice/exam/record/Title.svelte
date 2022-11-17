<script lang="ts">
  import * as kanjidate from "kanjidate";
  import {
    currentVisitId,
    tempVisitId,
    setTempVisitId,
    clearTempVisitId,
    addToMishuuList,
  } from "../ExamVars";
  import Pulldown from "@/lib/Pulldown.svelte";
  import Dialog from "@/lib/Dialog.svelte";
  import api from "@/lib/api";
  import { onDestroy } from "svelte";
  import type { TaskRunner } from "@/lib/unit-task";
  import FutanWariOverrideDialog from "./FutanWariOverrideDialog.svelte";
  import type { Meisai, VisitEx } from "myclinic-model";

  export let visit: VisitEx;

  let manipLink: HTMLElement;
  let manipPulldown: Pulldown;
  let taskRunner: TaskRunner | null = null;
  let meisaiDialog: Dialog;
  let futanWariDialog: FutanWariOverrideDialog;

  onDestroy(() => {
    taskRunner?.cancel();
  });

  function doManip(): void {
    manipPulldown.open();
  }

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
    meisaiDialog.open();
  }

  async function doFutanwariOverride() {
    futanWariDialog.open();
  }

  function doMishuuList(): void {
    addToMishuuList(visit);
  }

  function isMishuu(visit: VisitEx): boolean {
    const charge = visit.chargeOption?.charge;
    const pay = visit.lastPayment?.amount;
    return charge != null && charge > 0 && (
      pay == null || (pay === 0)
    );
  }

  function totalTenOf(meisai: Meisai): string {
    return meisai.totalTen.toLocaleString();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div
  class="top"
  class:current={visit.visitId === $currentVisitId}
  class:temp-visit={visit.visitId === $tempVisitId}
>
  <span class="datetime">{kanjidate.format(kanjidate.f9, visit.visitedAt)}</span
  >
  <a href="javascript:void(0)" bind:this={manipLink} on:click={doManip}>操作</a>
</div>

<!-- svelte-ignore a11y-invalid-attribute -->
<Pulldown anchor={manipLink} bind:this={manipPulldown}>
  <svelte:fragment>
    <a href="javascript:void(0)" on:click={doDeleteVisit}>この診察を削除</a>
    {#if visit.visitId !== $tempVisitId}
      <a href="javascript:void(0)" on:click={doSetTempVisitId}>暫定診察に設定</a
      >
    {:else}
      <a href="javascript:void(0)" on:click={doClearTempVisitId}
        >暫定診察の解除</a
      >
    {/if}
    <a href="javascript:void(0)" on:click={doMeisai}>診療明細</a>
    <a href="javascript:void(0)" on:click={doFutanwariOverride}
      >負担割オーバーライド</a
    >
    {#if isMishuu(visit)}
    <a href="javascript:void(0)" on:click={doMishuuList}>未収リストへ</a>
    {/if}
  </svelte:fragment>
</Pulldown>

<Dialog bind:this={meisaiDialog} let:close width="">
  <span slot="title">診療明細</span>
  {#await api.getMeisai(visit.visitId) then meisai}
    {#each meisai.items as item}
      <div>
        <div>{item.section}</div>
        {#each item.entries as entry}
          <div class="meisai-detail-item-row">
            <div class="meisai-detail-item label">{entry.label}</div>
            <div class="meisai-detail-item tanka-count">
              {entry.tanka.toLocaleString()}x{entry.count.toLocaleString()}
            </div>
            <div class="meisai-detail-item subtotal">
              {(entry.tanka * entry.count).toLocaleString()}
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
  <svelte:fragment slot="commands">
    <button on:click={close}>閉じる</button>
  </svelte:fragment>
</Dialog>

<FutanWariOverrideDialog bind:visit bind:this={futanWariDialog} />

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
</style>
