<script lang="ts">
  import type { 剤形区分, 情報区分, 薬品コード種別, 力価フラグ } from "@/lib/denshi-shohou/denshi-shohou";
  import ZaikeiKubunForm from "./ZaikeiKubunForm.svelte";
  import DrugKind from "./DrugKind.svelte";
  import KizaiKind from "./KizaiKind.svelte";

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
	if( 剤形区分 !== "医療材料" ){
	  情報区分 = "医薬品";
	} else {
	  情報区分 = "医療材料";
	}
  }
</script>

<div>新規薬剤</div>
<ZaikeiKubunForm 剤形区分="内服" onChange={doZaikeiKubunChange} />
{#if 剤形区分 !== "医療材料"}
  <DrugKind {薬品コード種別} {薬品コード} {薬品名称} {単位名} {at}/>
{:else}
  <KizaiKind />
{/if}
