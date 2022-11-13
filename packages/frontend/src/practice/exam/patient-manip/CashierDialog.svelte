<script lang="ts">
    import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import {
    MeisaiObject,
    MeisaiSectionDataObject,
    WqueueStateObject,
    type Meisai,
  } from "@/lib/model";
    import { writable, type Readable, type Writable } from "svelte/store";
    import { endPatient } from "../ExamVars";
  import ChargeForm from "./ChargeForm.svelte";

  export let visitId: Readable<number | null>;
  let meisai: Writable<Meisai | null> = writable(null);
  let meisaiItems: string[] = [];
  let summary: string = ""
  let chargeValue: Writable<number> = writable(0);
  let chargeRep = "";
  let mode = "disp";
  let dialog: Dialog;

  meisai.subscribe(m => {
    meisaiItems = mkMeisaiItems(m);
    summary = mkSummary(m);
    chargeValue.set(m == null ? 0 : m.charge);
  });

  chargeValue.subscribe(c => {
    chargeRep = mkChargeRep(c);
  })

  export async function open() {
    if( $visitId != null ){
      const m: Meisai = await api.getMeisai($visitId);
      meisai.set(m);
      dialog.open();
    }
  }

  function mkMeisaiItems(meisai: Meisai | null): string[] {
    if (meisai == null) {
      return [];
    } else {
      return meisai.items.map((item) => {
        const label: string = item.section;
        const subtotal: number = MeisaiSectionDataObject.subtotalOf(item);
        return `${label}：${subtotal}点`;
      });
    }
  }

  function mkSummary(meisai: Meisai | null): string {
    if (meisai == null) {
      return "";
    } else {
      const totalTen: number = MeisaiObject.totalTenOf(meisai);
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

  function doDefault(): void {
    if ($meisai == null) {
      chargeValue.set(0);
    } else {
      chargeValue.set($meisai.charge);
    }
  }

  async function doEnter(close: () => void) {
    if( $visitId != null ){
      await api.enterChargeValue($visitId, $chargeValue);
      await api.changeWqueueState($visitId, WqueueStateObject.WaitCashier.code);
      close();
      endPatient(WqueueStateObject.WaitCashier);
    }
  }
</script>

<Dialog bind:this={dialog} let:close>
  <span slot="title">会計</span>
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
        <a href="javascript:void(0)" on:click={doDefault}>既定値</a>
      </div>
    {:else if mode === "form"}
      <ChargeForm
        initValue={$chargeValue.toString()}
        onCancel={() => (mode = "disp")}
        onEnter={doFormEnter}
      />
    {/if}
  </div>
  <div class="commands">
    <button on:click={() => doEnter(close)} disabled={mode !== "disp"}>入力</button>
    <button on:click={close} disabled={mode !== "disp"}>キャンセル</button>
  </div>
</Dialog>

<style>
  .commands {
    display: flex;
    justify-content: flex-end;
  }

  .commands :global(button) {
    margin-left: 4px;
    margin-top: 10px;
  }
</style>
