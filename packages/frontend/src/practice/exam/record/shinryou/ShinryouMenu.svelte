<script lang="ts">
  import api from "@/lib/api";
  import type { VisitEx } from "myclinic-model";
  import RegularDialog from "./RegularDialog.svelte";
  import KensaDialog from "./KensaDialog.svelte";
  import SearchDialog from "./SearchDialog.svelte";
  import { getCopyTarget } from "@/practice/exam/exam-vars";
  import { enterTo } from "./helper";
  import CopySelectedDialog from "./CopySelectedDialog.svelte";
  import DeleteSelectedDialog from "./DeleteSelectedDialog.svelte";
  import { popupTrigger } from "@/lib/popup-helper";

  export let visit: VisitEx;

  async function doRegular() {
    const names = await api.getShinryouRegular();
    const d: RegularDialog = new RegularDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        names,
        visit,
      },
    });
  }

  async function doKensa() {
    const kensa = await api.getShinryouKensa();
    const d: KensaDialog = new KensaDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        kensa,
        visit,
      },
    });
  }

  function doSearch(): void {
    const d: SearchDialog = new SearchDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        visit,
      },
    });
  }

  function doDeleteSelected(): void {
    const d: DeleteSelectedDialog = new DeleteSelectedDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        visitId: visit.visitId,
        shinryouList: visit.shinryouList,
      },
    });
  }

  async function doDeleteDuplicate() {
    const foundCodes: Set<number> = new Set<number>();
    const dupShinryouIds: number[] = [];
    visit.shinryouList.forEach((s) => {
      const code = s.shinryoucode;
      if (foundCodes.has(code)) {
        dupShinryouIds.push(s.shinryouId);
      } else {
        foundCodes.add(s.shinryoucode);
      }
    });
    if (dupShinryouIds.length > 0) {
      await Promise.all(
        dupShinryouIds.map((shinryouId) => api.deleteShinryou(shinryouId))
      );
    }
  }

  function doCopySelected(): void {
    const targetId = getCopyTarget();
    if (targetId == null) {
      alert("コピー先をみつけられません。");
    } else {
      const d: CopySelectedDialog = new CopySelectedDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          targetVisitId: targetId,
          shinryouList: visit.shinryouList,
        },
      });
    }
  }

  async function doCopyAll() {
    const targetId = getCopyTarget();
    if (targetId != null) {
      const codes = visit.shinryouList.map((s) => s.shinryoucode);
      const targetVisit = await api.getVisit(targetId);
      try {
        await enterTo(targetId, targetVisit.visitedAt, codes, []);
      } catch (ex) {
        alert(ex);
      }
    } else {
      alert("コピー先をみつけられません。");
    }
  }
</script>

<div>
  <a href="javascript:void(0)" on:click={doRegular}>[診療行為]</a>
    <a href="javascript:void(0)" on:click={popupTrigger(() => [
      ["検査", doKensa],
      ["検索入力", doSearch],
      ["選択削除", doDeleteSelected],
      ["重複削除", doDeleteDuplicate],
      ["選択コピー", doCopySelected],
      ["全部コピー", doCopyAll],
    ])}
      >その他</a
    >
    <!-- <div slot="menu" class="popup-menu">
      <a href="javascript:void(0)" on:click={destroyAnd(doKensa)}>検査</a>
      <a href="javascript:void(0)" on:click={destroyAnd(doSearch)}>検索入力</a>
      <a href="javascript:void(0)" on:click={destroyAnd(doDeleteSelected)}
        >選択削除</a
      >
      <a href="javascript:void(0)" on:click={destroyAnd(doDeleteDuplicate)}
        >重複削除</a
      >
      <a href="javascript:void(0)" on:click={destroyAnd(doCopySelected)}
        >選択コピー</a
      >
      <a href="javascript:void(0)" on:click={destroyAnd(doCopyAll)}
        >全部コピー</a
      >
    </div> -->
</div>

<!-- <Pulldown anchor={auxLink} bind:this={auxPopup}>
  <div>
    <a href="javascript:void(0)" on:click={doKensa}>検査</a>
    <a href="javascript:void(0)" on:click={doSearch}>検索入力</a>
    <a href="javascript:void(0)" on:click={doDeleteSelected}>選択削除</a>
    <a href="javascript:void(0)" on:click={doDeleteDuplicate}>重複削除</a>
    <a href="javascript:void(0)" on:click={doCopySelected}>選択コピー</a>
    <a href="javascript:void(0)" on:click={doCopyAll}>全部コピー</a>
  </div>
</Pulldown> -->

<!-- <style>
  .popup-menu a {
    display: block;
    margin-bottom: 4px;
    color: black;
  }

  .popup-menu a:last-of-type {
    margin-bottom: 0;
  }
</style> -->
