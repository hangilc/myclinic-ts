<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import {
    MeisaiObject,
    MeisaiSectionDataObject,
    type Meisai,
    type MeisaiSectionData,
  } from "@/lib/model";
    import ChargeForm from "./ChargeForm.svelte";

  let dialog: Dialog;
  let meisaiItems: string[] = [];
  let summary: string = "";
  let chargeValue: number = 0;
  let chargeRep: string = "";
  let mode = "disp";

  export function open(meisai: Meisai) {
    chargeValue = meisai.charge;
    setupItems(meisai.items);
    setupSummary(meisai);
    setupChargeRep(meisai);
    dialog.open();
  }

  function setupItems(items: MeisaiSectionData[]): void {
    meisaiItems = items.map((item) => {
      const label: string = item.section;
      const subtotal: number = MeisaiSectionDataObject.subtotalOf(item);
      return `${label}：${subtotal}点`;
    });
  }

  function setupSummary(meisai: Meisai): void {
    const totalTen: number = MeisaiObject.totalTenOf(meisai);
    summary = `総点：${totalTen}点、負担割：${meisai.futanWari}割`;
  }

  function setupChargeRep(): void {
    chargeRep = `請求額：${chargeValue}円`;
  }

  function doModify(): void {
    mode = "form";
  }

  function doFormEnter(): void {
    setupChargeRep();
    mode = "disp";
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
    <div>{chargeRep} <a href="javascript:void(0)" on:click={doModify}>変更</a></div>
    {:else if mode === "form"}
    <ChargeForm bind:chargeValue onCancel={() => mode = "disp"} onEnter={doFormEnter}/>
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
