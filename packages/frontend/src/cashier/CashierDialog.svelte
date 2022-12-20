<script lang="ts">
  import api from "@/lib/api";
  import { ReceiptDrawerData } from "@/lib/drawer/receipt-drawer-data";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import {
    type Meisai,
    type Charge,
    type Patient, Payment,
    type Visit,
    dateToSqlDateTime,
  } from "myclinic-model";
  import type { WqueueData } from "./wq-data";

  export let data: WqueueData;
  export let charge: Charge;
  export let destroy: () => void;

  function patientLine(data: WqueueData): string {
    const p = data.patient;
    return `(${p.patientId}) ${p.fullName()} ${p.fullYomi()}`;
  }

  function getMeisai(data: WqueueData): Meisai {
    return data.meisai;
  }

  function getVisit(data: [Meisai, Visit, Patient, Charge]): Visit {
    return data[1];
  }

  function getCharge(data: [Meisai, Visit, Patient, Charge]): Charge {
    return data[3];
  }

  async function doFinishCashier() {
    let visit = getVisit(data);
    let charge = getCharge(data);
    let payment = new Payment(visit.visitId, charge.charge, dateToSqlDateTime(new Date()));
    await api.finishCashier(payment);
    destroy();
  }

  async function doPrintReceipt() {
    let data = new ReceiptDrawerData();
    data.setPatient()
  }
</script>

<SurfaceModal {destroy} title="会計">
  <div class="body">
    <div class="patient">
      {patientLine(data)})
    </div>
    <div class="detail">
      <div class="col1" />
      <div class="col2" />
      {#each getMeisai(data).items as item}
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
  </div>
  <div class="summary">
    <div>総点：{getMeisai(data).totalTen.toLocaleString()}点、、負担割：{getMeisai(data).futanWari}割</div>
    <div class="charge">請求額：{getCharge(data).charge.toLocaleString()}円</div>
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

  .detail {
    display: table;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    margin: 10px 0;
    padding: 10px 0;
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
