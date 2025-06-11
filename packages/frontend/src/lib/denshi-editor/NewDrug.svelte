<script lang="ts">
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
    力価フラグ,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import ZaikeiKubunForm from "./ZaikeiKubunForm.svelte";
  import DrugKind from "./DrugKind.svelte";
  import KizaiKind from "./KizaiKind.svelte";
  import DrugAmount from "./DrugAmount.svelte";
  import type { 薬品レコード } from "../denshi-shohou/presc-info";
  import { validateDrug } from "./helper";
  import { toHankaku } from "@/lib/zenkaku";

  export let onEnter: (created: 薬品レコード) => void;
  export let onDone: () => void;
  export let at: string;

  let 剤形区分: 剤形区分 = "内服";
  let 情報区分: 情報区分 = "医薬品";
  let 薬品コード種別: 薬品コード種別 = "レセプト電算処理システム用コード";
  let 薬品コード: string = "";
  let 薬品名称: string = "";
  let 分量: string = "";
  let 力価フラグ: 力価フラグ = "薬価単位";
  let 単位名: string = "";

  function doZaikeiKubunChange(value: 剤形区分) {
    剤形区分 = value;
    if (剤形区分 !== "医療材料") {
      情報区分 = "医薬品";
    } else {
      情報区分 = "医療材料";
    }
  }

  function doDrugKindChange(arg: {
    薬品コード種別: 薬品コード種別;
    薬品コード: string;
    薬品名称: string;
    単位名: string;
  }) {
    薬品コード種別 = arg.薬品コード種別;
    薬品コード = arg.薬品コード;
    薬品名称 = arg.薬品名称;
    単位名 = arg.単位名;
  }

  function doEnter() {
    let data: 薬品レコード = {
      情報区分,
      薬品コード種別,
      薬品コード,
      薬品名称,
      分量: toHankaku(分量),
      力価フラグ,
      単位名,
    };
	let err = validateDrug(data);
	if( typeof err === "string" ){
	  alert(err);
	} else {
	  onEnter(data);
	  onDone();
	}
  }

  function doCancel() {
    onDone();
  }
</script>

<div>新規薬剤</div>
<ZaikeiKubunForm 剤形区分="内服" onChange={doZaikeiKubunChange} />
{#if 剤形区分 !== "医療材料"}
  <DrugKind
    {薬品コード種別}
    {薬品コード}
    {薬品名称}
    {単位名}
    {at}
    onChange={doDrugKindChange}
  />
{:else}
  <KizaiKind />
{/if}
<div class="form-part">
  <DrugAmount bind:分量 {単位名} />
</div>
<div class="commands">
  <button on:click={doEnter}>入力</button>
  <button on:click={doCancel}>キャンセル</button>
</div>

<style>
  .form-part {
    margin: 10px 0;
  }

  .commands {
    text-align: right;
  }
</style>
