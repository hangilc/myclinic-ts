<script lang="ts">
  import DrugAmount from "./DrugAmount.svelte";
  import DrugKind from "./DrugKind.svelte";
  import KizaiKind from "./KizaiKind.svelte";
  import ZaikeiKubunForm from "./ZaikeiKubunForm.svelte";
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
  } from "@/lib/denshi-shohou/denshi-shohou";

  export let at: string;
  export let 剤形区分: 剤形区分;
  export let 情報区分: 情報区分;
  export let 薬品コード種別: 薬品コード種別;
  export let 薬品コード: string;
  export let 薬品名称: string;
  export let 分量: string;
  export let 単位名: string;

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
</script>

<ZaikeiKubunForm 剤形区分="内服" onChange={doZaikeiKubunChange} />
<DrugKind
  bind:薬品コード種別
  bind:薬品コード
  bind:薬品名称
  bind:単位名
  {at}
  onChange={doDrugKindChange}
/>
<div class="form-part">
  <DrugAmount bind:分量 {単位名} />
</div>

<style>
  .form-part {
    margin: 10px 0;
  }
</style>
