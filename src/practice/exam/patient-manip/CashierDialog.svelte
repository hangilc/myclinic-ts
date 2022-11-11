<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import {
    MeisaiObject,
    MeisaiSectionDataObject,
    type Meisai,
  } from "@/lib/model";
    import { writable, type Writable } from "svelte/store";
  import ChargeForm from "./ChargeForm.svelte";

  export let meisai: Writable<Meisai | null>;
  let meisaiItems: string[] = mkMeisaiItems($meisai);
  let summary: string = mkSummary($meisai);
  let chargeValue: Writable<number> = writable(0);
  let chargeRep = mkChargeRep($chargeValue);
  let mode = "disp";
  let dialog: Dialog;

  export function open() {
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
