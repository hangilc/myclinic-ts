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
</div>

