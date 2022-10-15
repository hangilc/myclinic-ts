<script lang="ts">
  import type * as m from "../../../lib/model"
  import * as kanjidate from "kanjidate"
  import { currentVisitId, tempVisitId, setTempVisitId, clearTempVisitId } from "../ExamVars"
  import Pulldown from "@/lib/Pulldown.svelte"
  import Dialog from "@/lib/Dialog.svelte"
  import api from "@/lib/api"
  import { onDestroy } from "svelte"
  import type { FetchTask, TaskRunner } from "@/lib/unit-task"
    import SelectItem from "@/lib/SelectItem.svelte";

  export let visit: m.VisitEx;

  let manipLink: HTMLElement;
  let manipPulldown: Pulldown;
  let taskRunner: TaskRunner | null = null;
  let meisaiDialog: Dialog;

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
    const meisai: m.Meisai = await api.getMeisai(visit.visitId);
    console.log(meisai.totalTen);
    meisaiDialog.open();
  }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="top" class:current={visit.visitId === $currentVisitId}
  class:temp-visit={visit.visitId === $tempVisitId}>
  <span class="datetime">{kanjidate.format(kanjidate.f9, visit.visitedAt)}</span>
  <a href="javascript:void(0)" bind:this={manipLink} on:click={doManip}>操作</a>
</div>

<!-- svelte-ignore a11y-invalid-attribute -->
<Pulldown anchor={manipLink} bind:this={manipPulldown}>
  <svelte:fragment>
    <a href="javascript:void(0)" on:click={doDeleteVisit}>この診察を削除</a>
    {#if visit.visitId !== $tempVisitId}
    <a href="javascript:void(0)" on:click={doSetTempVisitId}>暫定診察に設定</a>
    {:else}
    <a href="javascript:void(0)" on:click={doClearTempVisitId}>暫定診察の解除</a>
    {/if}
    <a href="javascript:void(0)" on:click={doMeisai}>診療明細</a>
    <a href="javascript:void(0)">負担割オーバーライド</a>
    <a href="javascript:void(0)">未収リストへ</a>
  </svelte:fragment>
</Pulldown>

<Dialog bind:this={meisaiDialog} let:close={close}>
  <span slot="title">診療明細</span>
  {#await api.getMeisai(visit.visitId)}
  {:then meisai}
    {#each meisai.items as item}
    <div>
      <div>{item.section}</div>
      {#each item.entries as entry}
      <div>
        <div>{entry.label}</div>
        <div>{entry.tanka}x{entry.count}</div>
        <div>{entry.tanka * entry.count}</div>
      </div>
      {/each}
    </div>
    {/each}
    <div>
      総点：{meisai.totalTen}点、負担割：{meisai.futanWari}割、自己負担：{meisai.charge}円
    </div>
  {/await}
  <svelte:fragment slot="commands">
    <button on:click={close}>閉じる</button>
  </svelte:fragment>
</Dialog>

<style>
  .top {
    padding: 3px 6px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content:space-between;
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
</style>