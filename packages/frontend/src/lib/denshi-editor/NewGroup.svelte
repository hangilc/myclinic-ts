<script lang="ts">
  import DrugForm from "./DrugForm.svelte";
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
    力価フラグ,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import type {
    薬品情報,
    薬品レコード,
    RP剤情報,
    剤形レコード,
    用法レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import DrugUsage from "./DrugUsage.svelte";
  import { toHankaku } from "@/lib/zenkaku";
  import { validateDrug } from "./helper";
  import DrugDays from "./DrugDays.svelte";

  export let onDone: () => void;
  export let at: string;
  export let onEnter: (group: RP剤情報) => void;

  let 剤形区分: 剤形区分 = "内服";
  let 情報区分: 情報区分 = "医薬品";
  let 薬品コード種別: 薬品コード種別 = "レセプト電算処理システム用コード";
  let 薬品コード: string = "";
  let 薬品名称: string = "";
  let 分量: string = "";
  let 力価フラグ: 力価フラグ = "薬価単位";
  let 単位名: string = "";
  let 用法コード: string = "";
  let 用法名称: string = "";
  let 調剤数量: number = 7;
  let timesText: string = 調剤数量.toString();

  function doCancel() {
    onDone();
  }

  function doEnter() {
    let record: 薬品レコード = {
      情報区分,
      薬品コード種別,
      薬品コード,
      薬品名称,
      分量: toHankaku(分量),
      力価フラグ,
      単位名,
    };
    let err = validateDrug(record);
    if (typeof err === "string") {
      alert(err);
      return;
    }
    let 薬品情報: 薬品情報 = {
      薬品レコード: record,
    };
	if( 用法コード === "" ){
	  alert("用法コードが設定されていません。");
	  return;
	}
	if( 用法名称 === "" ){
	  alert("用法名称が設定されていません。");
	  return;
	}
    let 用法レコード: 用法レコード = {
      用法コード,
      用法名称,
    };
    if (剤形区分 === "内服" || 剤形区分 === "頓服") {
	  let input = toHankaku(timesText.trim());
	  if( input === "" ){
		alert("日数・回数が設定されていません。");
		return;
	  }
	  調剤数量 = parseInt(input);
	  if( isNaN(調剤数量) ){
		alert("日数・回数が整数でありません。");
		return;
	  }
      if (調剤数量 <= 0) {
        alert("日数・回数が正の数値でありません。");
        return;
      }
    } else {
      調剤数量 = 1;
    }
    let 剤形レコード: 剤形レコード = {
      剤形区分,
      調剤数量,
    };
    let group: RP剤情報 = {
      剤形レコード,
      用法レコード,
      薬品情報グループ: [薬品情報],
    };
    onEnter(group);
    onDone();
  }
</script>

<DrugForm
  {at}
  bind:剤形区分
  bind:情報区分
  bind:薬品コード種別
  bind:薬品コード
  bind:薬品名称
  bind:分量
  bind:単位名
/>
<DrugUsage bind:用法コード bind:用法名称 />
{#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
  <DrugDays bind:剤形区分 bind:timesText />
{/if}

<div class="commands">
  <button on:click={doEnter}>入力</button>
  <button on:click={doCancel}>キャンセル</button>
</div>

<style>
  .commands {
    margin-top: 10px;
    text-align: right;
  }
</style>
