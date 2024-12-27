<script lang="ts">
  import Dialog from "../Dialog.svelte";
  import type { 剤形区分 } from "./denshi-shohou";
  import { amountDisp } from "./disp/disp-util";
  import NewDrugDialog from "./NewDrugDialog.svelte";
  import NewDrugForm from "./NewDrugForm.svelte";
  import type { 薬品レコード, 薬品情報 } from "./presc-info";

  export let destroy: () => void;
  export let at: string;
  let rp剤形区分: 剤形区分 = "内服";
  let drugs: 薬品情報[] = [];
  let showNewDrugForm = false;

  function doAddDrug() {
    const d: NewDrugDialog = new NewDrugDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        at,
        zaikei: rp剤形区分,
        onEnter: (master, amount) => {
          const record: 薬品レコード = {
            情報区分: "医薬品",
            薬品コード種別: "レセプト電算処理システム用コード",
            薬品コード: master.iyakuhincode.toString(),
            薬品名称: master.name,
            分量: amount,
            力価フラグ: "薬価単位",
            単位名: master.unit,
          };
          const drug: 薬品情報 = {
            薬品レコード: record,
            不均等レコード: undefined,
            薬品補足レコード: undefined,
          };
          drugs.push(drug);
          drugs = drugs;
        },
      },
    });
  }
</script>

<Dialog title="新規薬剤グループ" {destroy} styleWidth="400px">
  <div>
    <input type="radio" bind:group={rp剤形区分} value="内服" />内服
    <input type="radio" bind:group={rp剤形区分} value="頓服" />頓服
    <input type="radio" bind:group={rp剤形区分} value="外用" />外用
  </div>
  <div>
    {#each drugs as drug}
      <div>{drug.薬品レコード.薬品名称} {amountDisp(drug.薬品レコード)}</div>
    {/each}
  </div>
  <div style="margin-top:0px;">
    <a
      href="javascript:void(0)"
      on:click={() => { showNewDrugForm = !showNewDrugForm }}
      style="font-size:0.9rem">薬剤追加</a
    >
    {#if showNewDrugForm}
      <div style="margin:10px 0;border:1px solid gray;border-radius:4px;padding:10px;">
        <NewDrugForm onCancel={() => { showNewDrugForm = false;}} zaikei={rp剤形区分} {at} 
          onEnter={(drug) => { drugs.push(drug); showNewDrugForm = false; }}/>
      </div>
    {/if}
  </div>
</Dialog>
