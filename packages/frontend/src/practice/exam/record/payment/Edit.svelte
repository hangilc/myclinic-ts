<script lang="ts">
  import {
    type VisitEx,
    type Payment as ModelPayment,
    Wqueue,
    WqueueState,
  } from "myclinic-model";
  import { MeisaiWrapper } from "@/lib/rezept-meisai";
  import RightBox from "../../RightBox.svelte";
  import { setFocus } from "@/lib/set-focus";
  import { dateTimeToSql } from "@/lib/util";
  import api from "@/lib/api";
  import { ReceiptDrawerData } from "@/lib/drawer/forms/receipt/receipt-drawer-data";
  import { pad } from "@/lib/pad";
  import { showError } from "@/lib/show-error";
  import { confirm } from "@/lib/confirm-call";
  import { drawReceipt } from "@/lib/drawer/forms/receipt/receipt-drawer";

  export let visit: VisitEx;
  export let meisai: MeisaiWrapper | null = null;
  export let onClose: () => void;
  let show = false;
  let chargeInput: HTMLInputElement;

  export function open(
    m: MeisaiWrapper,
  ): void {
    meisai = m;
    show = true;
  }

  function close() {
    show = false;
    onClose();
  }

  function doPaymentFinished() {
    confirm("領収済にしていいですか？", async () => {
      const currentCharge = visit.chargeOption?.charge || 0;
      const pay: ModelPayment = {
        visitId: visit.visitId,
        amount: currentCharge,
        paytime: dateTimeToSql(new Date()),
      };
      await api.finishCashier(pay);
      close();
    });
  }

  function doNoPayment() {
    confirm("未収にしていいですか？", async () => {
      const pay: ModelPayment = {
        visitId: visit.visitId,
        amount: 0,
        paytime: dateTimeToSql(new Date()),
      };
      await api.finishCashier(pay);
      close();
    });
  }

  function makeTimestamp(d: Date): string {
    const fmtYear = pad(d.getFullYear(), 4);
    const fmtMonth = pad(d.getMonth() + 1, 2);
    const fmtDay = pad(d.getDate(), 2);
    const fmtHour = pad(d.getHours(), 2);
    const fmtMinute = pad(d.getMinutes(), 2);
    return `${fmtYear}${fmtMonth}${fmtDay}-${fmtHour}${fmtMinute}`;
  }

  async function doReceiptPdf() {
    if (meisai != null) {
      const patient = visit.patient;
      const clinicInfo = await api.getClinicInfo();
      const data = ReceiptDrawerData.create(visit, new MeisaiWrapper(meisai), clinicInfo);
      const ops = drawReceipt(data);
      const timestamp = makeTimestamp(new Date());
      const fileName = `Receipt-${patient.patientId}-${timestamp}.pdf`;
      await api.createPdfFile(ops, "A6_Landscape", fileName);
      await api.stampPdf(fileName, "receipt");
      const url = api.portalTmpFileUrl(fileName);
      if (window) {
        window.open(url, "_blank");
      }
    }
  }

  async function doEnter() {
    const t = chargeInput.value.trim();
    let chargeValue: number;
    try {
      chargeValue = parseInt(t);
    } catch (ex) {
      showError("請求額の入力が整数でありません");
      return;
    }
    if (chargeValue < 0) {
      showError("請求額が負の値です。");
      return;
    }
    await api.updateChargeValue(visit.visitId, chargeValue);
    const wqueueOpt = await api.findWqueue(visit.visitId);
    if (wqueueOpt == null) {
      const wq: Wqueue = new Wqueue(
        visit.visitId,
        WqueueState.WaitCashier.code
      );
      await api.enterWqueue(wq);
    } else {
      await api.changeWqueueState(visit.visitId, WqueueState.WaitCashier.code);
    }
    close();
  }
</script>

{#if show}
  <RightBox title="請求額の変更">
    {#if meisai != null}
      <div>
        <div>診療報酬総点 {meisai.totalTen()}点</div>
        <div>負担割 {meisai.futanWari}割</div>
        <div>現在の請求額 {visit.chargeOption?.charge || 0}円</div>
        <div>
          変更後請求額 <input
            type="text"
            bind:this={chargeInput}
            class="charge-input"
            use:setFocus
            value={meisai.charge}
          />円
        </div>
      </div>
    {/if}
    <div class="commands">
      <a href="javascript:void(0)" on:click={doPaymentFinished}>領収済に</a>
      <a href="javascript:void(0)" on:click={doNoPayment}>未収に</a>
      <a href="javascript:void(0)" on:click={doReceiptPdf}>領収書PDF</a>
      <button on:click={doEnter}>入力</button>
      <button on:click={close}>キャンセル</button>
    </div>
  </RightBox>
{/if}

<style>
  .commands {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .commands :global(a),
  .commands :global(button) {
    margin-left: 4px;
  }

  .charge-input {
    width: 5em;
  }
</style>
