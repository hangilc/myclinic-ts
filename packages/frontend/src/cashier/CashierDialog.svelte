<script lang="ts">
  import api from "@/lib/api";
  import { ReceiptDrawerData } from "@/lib/drawer/forms/receipt/receipt-drawer-data";
  import Dialog from "@/lib/Dialog.svelte";
  import {
    type Charge,
    type Patient,
    Payment,
    dateToSqlDateTime,
    VisitEx,
  } from "myclinic-model";
  import { hokenRep } from "@/lib/hoken-rep";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { drawReceipt } from "@/lib/drawer/forms/receipt/receipt-drawer";
  import type { MeisaiWrapper } from "@/lib/rezept-meisai";
  import { cache } from "@/lib/cache";
  import { FormatDate } from "myclinic-util";

  export let patient: Patient;
  export let visit: VisitEx;
  export let meisai: MeisaiWrapper;
  export let charge: Charge;
  export let destroy: () => void;
  export let receiptHook: (data: ReceiptDrawerData) => void = (_) => {};

  let showPrevPaymentList = false;
  let prevPayments: Payment[] = [];

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
    console.log("attr", visit.attributesStore);
    let receipt = ReceiptDrawerData.create(
      visit, meisai, await cache.getClinicInfo()
    );
    receiptHook(receipt);
    let ops = drawReceipt(receipt);
    const dlog: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => dlog.$destroy(),
        title: "領収書印刷",
        width: 148,
        height: 105,
        scale: 3,
        kind: "receipt",
        ops,
      },
    });
  }

  async function doShowPrevPayment() {
    prevPayments = await api.listPayment(visit.visitId);
    showPrevPaymentList = true;
  }

  function doHidePrevPayment() {
    showPrevPaymentList = false;
    prevPayments = [];
  }
</script>

        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <Dialog {destroy} title="会計">
  <div class="body">
    <div class="patient">
      {patientLine(patient)})
    </div>
    <div>
      {FormatDate.f9(visit.visitedAt)}
    </div>
    <div class="detail-wrapper">
      {#if meisai.items.length > 0}
        {@const grouped = meisai.getGrouped()}
        <div class="detail">
          <div class="col1" />
          <div class="col2" />
          {#each grouped.keys() as section}
            <div class="item-row">
              <div class="item-cell1 header">{section}</div>
              <div class="item-cell2" />
            </div>
            {#each grouped.get(section)?.items ?? [] as entry}
              <div class="item-row">
                <div class="item-cell1">{entry.label}</div>
                <div class="item-cell2">
                  {entry.ten.toLocaleString()}x{entry.count}={(entry.ten * entry.count).toLocaleString()}
                </div>
              </div>
            {/each}
          {/each}
          <!-- {#each meisai.items as item}
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
          {/each} -->
        </div>
      {:else}
        明細なし
      {/if}
    </div>
  </div>
  <div class="summary">
    <div>
      総点：{meisai.totalTen().toLocaleString()}点、、負担割：{meisai.futanWari}割
    </div>
    <div class="charge">請求額：{charge.charge.toLocaleString()}円</div>
    {#if visit.lastPayment}
      {@const amount = visit.lastPayment?.amount ?? 0}
      <div class="last-payment">
        前回受領額：{amount.toLocaleString()}円 今回差額：{(
          charge.charge - amount
        ).toLocaleString()}円
      </div>
    {/if}
  </div>
  <div class="prev-payment-wrapper">
    <div class="prev-payment-menu">
      <div class="prev-payment-title">領収履歴</div>
      {#if !showPrevPaymentList}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="gray"
          width="16"
          on:click={doShowPrevPayment}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="gray"
          width="16"
          on:click={doHidePrevPayment}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      {/if}
    </div>
    {#if showPrevPaymentList}
      <div class="prev-payment-list">
        {#if prevPayments.length > 0}
          {#each prevPayments as pay}
            <div>
              {pay.paytime} {pay.amount.toLocaleString()}円
            </div>
          {/each}
        {:else}
          （なし）
        {/if}
      </div>
    {/if}
  </div>
  <div class="commands">
    <button on:click={doPrintReceipt}>領収書印刷</button>
    <button on:click={doFinishCashier}>会計終了</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

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

  .prev-payment-wrapper {
    margin: 10px 0;
  }

  .prev-payment-menu {
    display: flex;
    align-content: center;
  }

  .prev-payment-menu .prev-payment-title {
    display: inline-block;
    margin-right: 6px;
  }

  .prev-payment-menu svg {
    cursor: pointer;
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

  .last-payment {
    font-weight: bold;
    color: green;
  }
</style>
