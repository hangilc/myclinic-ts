<script lang="ts">
  import { mishuuList, clearMishuuList } from "@/practice/exam/ExamVars"
  import RightBox from "../RightBox.svelte"
  import * as kanjidate from "kanjidate"
  import type { VisitEx } from "@/lib/model"
  import { pad } from "@/lib/pad"
    import { ReceiptDrawerData } from "@/lib/drawer/ReceiptDrawerData";
    import api from "@/lib/api";

  function sum(list: VisitEx[]): number {
    return list.reduce((acc, ele) => acc + ele.chargeOption?.charge || 0, 0);
  }

  function receiptPdfFileName(visit: VisitEx): string {
    const at = new Date(visit.visitedAt)
    const stamp = `${pad(at.getFullYear(), 4)}${pad(at.getMonth()+1, 2)}${pad(at.getDate(), 2)}`;
    return `receipt-${visit.patient.patientId}-${visit.visitId}-${stamp}.pdf`;
  }

  async function doReceiptPdf(visits: VisitEx[]) {
    const promises = visits.map(async visit => {
      const file = receiptPdfFileName(visit);
      const meisai = await api.getMeisai(visit.visitId);
      const data = ReceiptDrawerData.create(visit, meisai);
      const ops = await api.drawReceipt(data);
      await api.createPdfFile(ops, "A6_Landscape", file);
      await api.stampPdf(file, "receipt");
    });
    await Promise.all(promises)
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
{#if $mishuuList.length > 0}
<RightBox title="未収リスト">
  {#each $mishuuList as visit (visit.visitId)}
  {@const date = kanjidate.format(kanjidate.f2, visit.visitedAt)}
    <div>
      {date} &nbsp; {(visit.chargeOption?.charge || 0).toLocaleString()}円
    </div>
  {/each}
  <hr />
  <div class="sum">
    合計 {sum($mishuuList).toLocaleString()}円
  </div>
  <div class="commands">
    <button on:click={() => doReceiptPdf($mishuuList)}>領収書PDF</button>
    <button>会計済に</button>
    <a href="javascript:void(0)" on:click={clearMishuuList}>閉じる</a>
  </div>
</RightBox>
{/if}