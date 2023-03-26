<script lang="ts">
  import api from "@/lib/api";
  import { ReceiptDrawerData } from "@/lib/drawer/receipt-drawer-data";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import {
    type Meisai,
    type Charge,
    type Patient,
    Payment,
    type Visit,
    dateToSqlDateTime,
    VisitEx,
  } from "myclinic-model";
  import * as kanjidate from "kanjidate";
  import { hokenRep } from "@/lib/hoken-rep";
  import DrawerDialog2 from "@/lib/drawer/DrawerDialog2.svelte";

  export let patient: Patient;
  export let visit: VisitEx;
  export let meisai: Meisai;
  export let charge: Charge;
  export let destroy: () => void;
  export let receiptHook: (data: ReceiptDrawerData) => void = (_) => {};

  function patientLine(p: Patient): string {
    return `(${p.patientId}) ${p.fullName()} ${p.fullYomi()}`;
  }

  async function doFinishCashier() {
    let payment = new Payment(
      visit.visitId,
      charge.charge,
      dateToSqlDateTime(new Date())
    );
    await api.finishCashier(payment);
    destroy();
  }

  async function doPrintReceipt() {
    let receipt = new ReceiptDrawerData();
    receipt.setPatient(patient);
    receipt.visitDate = kanjidate.format(kanjidate.f2, visit.visitedAtAsDate);
    receipt.issueDate = kanjidate.format(kanjidate.f2, new Date());
    receipt.hoken = hokenRep(visit);
    receipt.futanWari =
      meisai.futanWari === 10 ? "" : meisai.futanWari.toString();
    receipt.setMeisai(meisai);
    receipt.charge = charge.charge;
    receiptHook(receipt);
    let ops = await api.drawReceipt(receipt);
    const dlog: DrawerDialog2 = new DrawerDialog2({
      target: document.body,
      props: {
        destroy: () => dlog.$destroy(),
        title: "領収書印刷",
        width: 148,
        height: 105,
        previewScale: 3,
        kind: "receipt",
        ops,
      },
    });
  }
</script>

<SurfaceModal {destroy} title="会計">
  <div class="body">
    <div class="patient">
      {patientLine(patient)})
    </div>
    <div>
      {kanjidate.format(kanjidate.f9, visit.visitedAt)}
    </div>
    <div class="detail-wrapper">
      {#if meisai.items.length > 0}
        <div class="detail">
          <div class="col1" />
          <div class="col2" />
          {#each meisai.items as item}
            <div class="item-row">
              <div class="item-cell1 header">{item.section.label}</div>
              <div class="item-cell2" />
            </div>
            {#each item.entries as entry}
              <div class="item-row">
                <div class="item-cell1">{entry.label}</div>
                <div class="item-cell2">
                  {entry.tanka.toLocaleString()}x{entry.count}={entry.totalTen.toLocaleString()}
                </div>
              </div>
            {/each}
          {/each}
        </div>
      {:else}
        明細なし
      {/if}
    </div>
  </div>
  <div class="summary">
    <div>
      総点：{meisai.totalTen.toLocaleString()}点、、負担割：{meisai.futanWari}割
    </div>
    <div class="charge">請求額：{charge.charge.toLocaleString()}円</div>
  </div>
  <div class="commands">
    <button on:click={doPrintReceipt}>領収書印刷</button>
    <button on:click={doFinishCashier}>会計終了</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .body {
    width: 360px;
  }

  .patient {
    font-weight: bold;
  }

  .detail-wrapper {
    display: block;
    max-height: 200px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid gray;
    margin: 10px 0;
    padding: 4px 10px;
  }

  .detail {
    display: table;
    /* border-top: 1px solid black;
    border-bottom: 1px solid black; */
    /* margin: 10px 0; */
    /* padding: 10px 0; */
  }

  .detail .col1 {
    display: table-column;
    width: auto;
  }

  .detail .col2 {
    display: table-column;
    width: 6rem;
  }

  .detail .item-row {
    display: table-row;
  }

  .detail .item-cell1,
  .detail .item-cell2 {
    display: table-cell;
  }

  .detail .item-cell2 {
    text-align: right;
  }

  .header {
    font-weight: bold;
  }

  .charge {
    color: blue;
    font-weight: bold;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
