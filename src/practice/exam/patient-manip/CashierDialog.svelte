<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import {
    MeisaiObject,
    MeisaiSectionDataObject,
    type Meisai,
  } from "@/lib/model";
  import ChargeForm from "./ChargeForm.svelte";

  let dialog: Dialog;
  let meisai: Meisai | null = null;
  let meisaiItems: string[] = [];
  let summary: string = "";
  let chargeValue: number = 0;
  let chargeRep: string = "";
  $: {
    meisaiItems = mkMeisaiItems(meisai);
    summary = mkSummary(meisai);
    chargeValue = meisai == null ? 0 : meisai.charge;
    chargeRep = mkChargeRep(chargeValue);
  }
  let mode = "disp";
  let formChargeValue = "";

  export function open(meisaiArg: Meisai) {
    meisai = meisaiArg;
    dialog.open();
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
    formChargeValue = "";
    mode = "form";
  }

  function doFormEnter(n: number): void {
    chargeValue = n;
    alert(n);
    mode = "disp";
  }

  function doDefault(): void {
    if (meisai == null) {
      chargeValue = 0;
    } else {
      chargeValue = meisai.charge;
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
        chargeValue={formChargeValue}
        onCancel={() => (mode = "disp")}
        onEnter={doFormEnter}
      />
    {/if}
  </div>
  <div class="commands">
    <button disabled={mode !== "disp"}>入力</button>
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
