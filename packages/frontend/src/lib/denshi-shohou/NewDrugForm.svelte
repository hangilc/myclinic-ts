<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import SearchIyakuhinMasterDialog from "./SearchIyakuhinMasterDialog.svelte";
  import type { 薬品レコード, 薬品情報 } from "./presc-info";
  import type { 剤形区分 } from "./denshi-shohou";
  import { toHankaku } from "../zenkaku";

  export let at: string;
  export let onCancel: () => void;
  export let onEnter: (drug: 薬品情報) => void;
  export let zaikei: 剤形区分;
  let master: IyakuhinMaster | undefined = undefined;
  let amount = "";
  let amountInputElement: HTMLInputElement;

  function doSearchMaster() {
    let masterZaikei: "内服" | "外用" | "すべて" = "すべて";
    if( zaikei === "内服" || zaikei === "頓服" ){
      masterZaikei = "内服";
    } else if( zaikei === "外用" ){
      masterZaikei = "外用";
    }
    const d: SearchIyakuhinMasterDialog = new SearchIyakuhinMasterDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        at,
        onEnter: (m) => {
          master = m;
          amountInputElement?.focus();
        },
        masterZaikei,
      },
    });
  }

  function doEnter() {
    if (!master) {
      alert("薬品名が設定されていません。");
      return;
    }
    amount = toHankaku(amount.trim());
    if (!/^\d+$|^\d+\.\d+$/.test(amount)) {
      alert("分量の入力が不適切です。");
      return;
    }
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
    onEnter(drug);
  }
</script>

<div class="form-grid">
  <div style="text-align:right">薬剤名：</div>
  <div>
    {master ? master.name : "（未設定）"}
    <a
      href="javascript:void(0)"
      on:click={doSearchMaster}
      style="white-space:nowrap;font-size:0.9rem">マスター検索</a
    >
  </div>
  <div style="text-align:right">分量：</div>
  <div>
    <input type="text" bind:value={amount} style="width:2em;" bind:this={amountInputElement} />
    {master ? master.unit : ""}
  </div>
</div>
<div style="margin-top:10px;text-align:right;">
  <button on:click={doEnter} disabled={!(master && amount)}>追加</button>
  <button on:click={onCancel}>キャンセル</button>
</div>

<style>
  .form-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
</style>
