<script lang="ts">
  import type { VisitEx } from "myclinic-model";
  import EnterXpWidget from "./EnterXpWidget.svelte";
  import EnterInjectWidget from "./EnterInjectWidget.svelte";
  import Popup from "@/lib/Popup.svelte";
  import { getCopyTarget } from "../../ExamVars";
  import { enterTo } from "../shinryou/helper";
  import api from "@/lib/api";

  export let visit: VisitEx;
  let enterXpWidget: EnterXpWidget;
  let enterInjectWidget: EnterInjectWidget;

  function doXp(): void {
    enterXpWidget.open();
  }

  function doInject(): void {
    enterInjectWidget.open();
  }

  async function doCopyAll() {
    const targetVisitId = getCopyTarget();
    if (targetVisitId !== null) {
      const target = await api.getVisit(targetVisitId);
      await enterTo(
        target.visitId,
        target.visitedAt.substring(0, 10),
        [],
        visit.conducts.map((c) => {
          return {
            kind: c.kind,
            labelOption: c.gazouLabel,
            shinryou: c.shinryouList.map(s => s.shinryoucode),
            drug: c.drugs.map(d => ({ iyakuhincode: d.iyakuhincode, amount: d.amount })),
            kizai: c.kizaiList.map(k => ({ code: k.kizaicode, amount: k.amount})),
          };
        })
      );
    } else {
      alert("コピー先がありません。");
    }
  }
</script>

<Popup let:destroyAnd let:trigger>
  <a href="javascript:void(0)" on:click={trigger}>処置</a>
  <div slot="menu" class="popup-menu">
    <a href="javascript:void(0)" on:click={destroyAnd(doXp)}>Ｘ線検査追加</a>
    <a href="javascript:void(0)" on:click={destroyAnd(doInject)}>注射追加</a>
    <a href="javascript:void(0)" on:click={destroyAnd(doCopyAll)}>全部コピー</a>
  </div>
</Popup>
<div>
  <EnterXpWidget {visit} bind:this={enterXpWidget} />
  <EnterInjectWidget {visit} bind:this={enterInjectWidget} />
</div>

<style>
  .popup-menu a {
    display: block;
    margin-bottom: 4px;
    color: black;
  }

  .popup-menu a:last-of-type {
    margin-bottom: 0;
  }
</style>
