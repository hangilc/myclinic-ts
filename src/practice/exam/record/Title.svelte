<script lang="ts">
  import type * as m from "../../../lib/model"
  import * as kanjidate from "kanjidate"
  import { currentVisitId, tempVisitId } from "../ExamVars"
  import Pulldown from "@/lib/Pulldown.svelte"
  import api from "@/lib/api"

  export let visit: m.VisitEx;

  let manipLink: HTMLElement;
  let manipPulldown: Pulldown;

  function doManip(): void {
    manipPulldown.open();
  }

  function doDeleteVisit(): void {
    api.deleteVisit(visit.visitId);
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
    <a href="javascript:void(0)">暫定診察に設定</a>
    <a href="javascript:void(0)">暫定診察の解除</a>
    <a href="javascript:void(0)">診療明細</a>
    <a href="javascript:void(0)">負担割オーバーライド</a>
    <a href="javascript:void(0)">未収リストへ</a>
  </svelte:fragment>
</Pulldown>

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