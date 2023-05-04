<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { genid } from "@/lib/genid";
  import { dateTimeToSql } from "@/lib/util";
  import { WqueueState, type Meisai, type Payment } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import { endPatient } from "../ExamVars";
  import ChargeForm from "./ChargeForm.svelte";

  export let destroy: () => void;
  export let visitId: Readable<number | null>;
  export let meisai: Meisai;
  export let gendogaku: number | undefined;
  export let monthlyFutan: number | undefined = undefined;

  let meisaiItems: string[] = mkMeisaiItems(meisai);
  let summary: string = mkSummary(meisai);
  let chargeValue:string = meisai.charge.toString();
  let mode = "disp";
  let isMishuu = false;
  const mishuuId = genid();

  function mkMeisaiItems(meisai: Meisai | null): string[] {
    if (meisai == null) {
      return [];
    } else {
      return meisai.items.map((item) => {
        const label: string = item.section.label;
        const subtotal: number = item.totalTen;
        return `${label}：${subtotal}点`;
      });
    }
  }

  function mkSummary(meisai: Meisai | null): string {
    if (meisai == null) {
      return "";
    } else {
      const totalTen: number = meisai.totalTen;
      return `総点：${totalTen}点、負担割：${meisai.futanWari}割`;
    }
  }

  function doModify(): void {
    mode = "form";
  }

  function doFormEnter(n: number): void {
    chargeValue = n.toString();
    mode = "disp";
  }

  async function doEnter(close: () => void) {
    if ($visitId != null) {
      const charge: number = parseInt(chargeValue);
      if( isNaN(charge) ){
        alert("請求金額が数字でありません。");
        return;
      }
      await api.enterChargeValue($visitId, charge);
      if (isMishuu) {
        const pay: Payment = {
          visitId: $visitId,
          amount: 0,
          paytime: dateTimeToSql(new Date()),
        };
        await api.finishCashier(pay);
        close();
        endPatient();
      } else {
        await api.changeWqueueState($visitId, WqueueState.WaitCashier.code);
        close();
        endPatient(WqueueState.WaitCashier);
      }
    }
  }

  function close(): void {
    destroy();
  }
</script>

<Dialog {destroy} title="会計">
  <div>
    {#each meisaiItems as item}
      <div>{item}</div>
    {/each}
  </div>
  <div>{summary}</div>
  <div>
    {#if mode === "disp"}
      <div>
        請求額：{chargeValue}円
        <a href="javascript:void(0)" on:click={doModify}>変更</a>
      </div>
    {:else if mode === "form"}
      <div class="charge-form-wrapper">
        <ChargeForm
          initValue={chargeValue}
          meisaiChargeValue={meisai.charge}
          onCancel={() => (mode = "disp")}
          onEnter={doFormEnter}
        />
      </div>
    {/if}
  </div>
  <div>
    限度額：{gendogaku !== undefined ? `${gendogaku.toLocaleString()}円` : "（未提出）"}
    負担額：{monthlyFutan !== undefined ? `${monthlyFutan.toLocaleString()}円` : "（未計算）"}
  </div>
  <div class="commands">
    <input type="checkbox" bind:value={isMishuu} id={mishuuId} /><label
      for={mishuuId}>未収扱</label
    >
    <button on:click={() => doEnter(close)} disabled={mode !== "disp"}
      >入力</button
    >
    <button on:click={close} disabled={mode !== "disp"}>キャンセル</button>
  </div>
</Dialog>

<style>
  .charge-form-wrapper {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid gray;
    border-radius: 6px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
  }

  .commands :global(button) {
    margin-left: 4px;
  }
</style>
