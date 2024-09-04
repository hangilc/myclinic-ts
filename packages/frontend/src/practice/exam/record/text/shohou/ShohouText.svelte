<script lang="ts">
  import type { Text } from "myclinic-model";
  import type { ShohouTextMemo } from "../text-memo";
  import {
    renderDrug,
    type RenderedDrug,
  } from "@/lib/denshi-shohou/presc-renderer";
  import api from "@/lib/api";
  import {
    shohouHikaeFilename,
  } from "@/lib/denshi-shohou/presc-api";
  import DenshiShohouDialog from "@/lib/denshi-shohou/DenshiShohouDialog.svelte";

  export let text: Text;

  let memo: ShohouTextMemo | undefined = undefined;
  let drugs: RenderedDrug[] = [];
  let accessCode: string | undefined = undefined;
  let prescriptionId: string | undefined = undefined;

  $: adaptToText(text);

  function adaptToText(t: Text) {
    if (t && t.memo) {
      let m: ShohouTextMemo = JSON.parse(t.memo);
      memo = m;
      drugs = m.shohou.RP剤情報グループ.map((group) => renderDrug(group));
      accessCode = m.shohou.引換番号;
      prescriptionId = m.prescriptionId;
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
  </div>
  <div>
    {#if accessCode}
      引換番号：{accessCode}
      {#if memo?.prescriptionId}
        <a href="javascript:void(0)" on:click={doHikae}>控え</a>
      {/if}
    {:else}
      <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
  </div>
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
