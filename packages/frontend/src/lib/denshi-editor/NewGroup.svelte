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
    不均等レコード,
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
  let isEditing薬品コード= true;
  let 薬品名称: string = "";
  let 分量: string = "";
  let isEditing分量 = true;
  let 力価フラグ: 力価フラグ = "薬価単位";
  let 単位名: string = "";
  let 用法コード: string = "";
  let isEditing用法コード = true;
  let 用法名称: string = "";
  let 調剤数量: number = 5;
  let isEditing調剤数量 = true;
  let 不均等レコード: 不均等レコード| undefined = undefined;
  let isEditing不均等レコード = false;

  function doCancel() {
    onDone();
  }

  function isEditing(): string | false {
	
	if(isEditing薬品コード){
	  return "薬品コード";
	}
	if(isEditing分量){
	  return "分量";
	}
	if(isEditing用法コード){
	  return "用法コード";
	}
	if(isEditing調剤数量){
	  return "調剤数量";
	}
	if(isEditing不均等レコード){
	  return "不均等レコード";
	}
	return false;
  }

  function doEnter() {
	let editing = isEditing();
	if( editing ){
	  alert(`入力中の項目があります。（${editing}）`);
	  return;
	}
    let record: 薬品レコード = {
      情報区分,
      薬品コード種別,
      薬品コード,
      薬品名称,
      分量: toHankaku(分量),
      力価フラグ,
      単位名,
    };
    let 薬品情報: 薬品情報 = {
      薬品レコード: record,
	  不均等レコード,
    };
    let 用法レコード: 用法レコード = {
      用法コード,
      用法名称,
    };
    if (剤形区分 === "内服" || 剤形区分 === "頓服") {
	  // nop
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
  bind:isEditing薬品コード
  bind:薬品名称
  bind:分量
  bind:isEditing分量
  bind:単位名
  bind:不均等レコード
  bind:isEditing不均等レコード
/>
<div class="form-part">
  <DrugUsage bind:用法コード bind:用法名称 bind:isEditing={isEditing用法コード} />
</div>
{#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
  <DrugDays bind:剤形区分 bind:調剤数量 bind:isEditing={isEditing調剤数量} />
{/if}

<div class="commands">
  <button on:click={doEnter}>入力</button>
  <button on:click={doCancel}>キャンセル</button>
</div>

<style>
  .form-part {
	margin: 10px 0;
  }
  .commands {
    margin-top: 10px;
    text-align: right;
  }
</style>
