<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { genid } from "@/lib/genid";
  import { dateTimeToSql } from "@/lib/util";
  import { WqueueState, type Meisai, type Payment } from "myclinic-model";
  import { writable, type Readable, type Writable } from "svelte/store";
  import { endPatient } from "../ExamVars";
  import ChargeForm from "./ChargeForm.svelte";

  export let destroy: () => void;
  export let visitId: Readable<number | null>;
  export let meisai: Meisai;
  let meisaiItems: string[] = mkMeisaiItems(meisai);
  let summary: string = mkSummary(meisai);
  let chargeValue: Writable<number> = writable(meisai.charge);
  let chargeRep: string = mkChargeRep($chargeValue);
  let mode = "disp";
  let dialog: Dialog;
  let isMishuu = false;
  const mishuuId = genid();

  // meisai.subscribe((m) => {
  //   meisaiItems = mkMeisaiItems(m);
  //   summary = mkSummary(m);
  //   chargeValue.set(m == null ? 0 : m.charge);
  // });

  // chargeValue.subscribe((c) => {
  //   chargeRep = mkChargeRep(c);
  // });

  
  // export async function open() {
  //   if ($visitId != null) {
  //     const m: Meisai = await api.getMeisai($visitId);
  //     meisai.set(m);
  //     dialog.open();
  //   }
  // }

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

  function mkChargeRep(chargeValue: number): string {
    return `請求額：${chargeValue}円`;
  }

  function doModify(): void {
    mode = "form";
  }

  function doFormEnter(n: number): void {
    chargeValue.set(n);
    mode = "disp";
  }

  async function doEnter(close: () => void) {
    if ($visitId != null) {
      await api.enterChargeValue($visitId, $chargeValue);
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
        {chargeRep}
        <a href="javascript:void(0)" on:click={doModify}>変更</a>
      </div>
    {:else if mode === "form"}
      <div class="charge-form-wrapper">
        <ChargeForm
          initValue={$chargeValue.toString()}
          meisaiChargeValue={meisai.charge}
          onCancel={() => (mode = "disp")}
          onEnter={doFormEnter}
        />
      </div>
    {/if}
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
