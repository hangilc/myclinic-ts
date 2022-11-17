<script lang="ts">
  import { mishuuList, clearMishuuList } from "@/practice/exam/ExamVars";
  import RightBox from "../RightBox.svelte";
  import * as kanjidate from "kanjidate";
  import type { Payment, VisitEx } from "myclinic-model";
  import { pad } from "@/lib/pad";
  import { ReceiptDrawerData } from "@/lib/drawer/ReceiptDrawerData";
  import api from "@/lib/api";

  let pdfFiles: string[] = [];

  function sum(list: VisitEx[]): number {
    return list.reduce((acc, ele) => acc + (ele.chargeOption?.charge ?? 0), 0);
  }

  function makeStamp(at: Date): string {
    return `${pad(at.getFullYear(), 4)}${pad(at.getMonth() + 1, 2)}${pad(
      at.getDate(),
      2
    )}`;
  }

  function receiptPdfFileName(visit: VisitEx): string {
    const stamp = makeStamp(new Date(visit.visitedAt));
    return `receipt-${visit.patient.patientId}-${visit.visitId}-${stamp}.pdf`;
  }

  function bundlePdfFileName(patientId: number): string {
    const stamp = makeStamp(new Date());
    return `receipt-bundle-${patientId}-${stamp}.pdf`;
  }

  async function doReceiptPdf(visits: VisitEx[]) {
    const patientIds: Set<number> = new Set();
    visits.forEach((visit) => patientIds.add(visit.patient.patientId));
    let patientId: number;
    if (patientIds.size === 0) {
      return;
    } else if (patientIds.size === 1) {
      patientId = Array.from(patientIds)[0];
    } else {
      alert("Error: multiple patients.");
      return;
    }
    const files: string[] = [];
    const promises = visits.map(async (visit) => {
      const file = receiptPdfFileName(visit);
      files.push(file);
      const meisai = await api.getMeisai(visit.visitId);
      const data = ReceiptDrawerData.create(visit, meisai);
      const ops = await api.drawReceipt(data);
      await api.createPdfFile(ops, "A6_Landscape", file);
      await api.stampPdf(file, "receipt");
    });
    await Promise.all(promises);
    const outFile = bundlePdfFileName(patientId);
    await api.concatPdfFiles(files, outFile);
    const url = api.portalTmpFileUrl(outFile);
    if (window) {
      window.open(url, "_blank");
      pdfFiles.push(outFile);
      console.log("pdfFiles", pdfFiles);
    }
  }

  async function doClose() {
    clearMishuuList();
    const promises = pdfFiles.map((file) => api.deletePortalTmpFile(file));
    await Promise.all(promises);
    pdfFiles = [];
  }

  async function doFinished(visits: VisitEx[]) {
    const promises = visits.map(async (visit) => {
      const pay: Payment = {
        visitId: visit.visitId,
        amount: visit.chargeOption?.charge || 0,
        paytime: kanjidate.format(kanjidate.fSqlDateTime, new Date()),
      };
      await api.enterPayment(pay);
    });
    await Promise.all(promises);
    await doClose();
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
      <button on:click={() => doFinished($mishuuList)}>会計済に</button>
      <a href="javascript:void(0)" on:click={doClose}>閉じる</a>
    </div>
  </RightBox>
{/if}
