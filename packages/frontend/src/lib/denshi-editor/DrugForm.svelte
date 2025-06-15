<script lang="ts">
  import DrugAmount from "./DrugAmount.svelte";
  import DrugKind from "./DrugKind.svelte";
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
  export let 単位名: string | undefined;

  let drugFormKey = 1;

  function doZaikeiKubunChange(new剤形区分: 剤形区分) {
    const new情報区分: 情報区分 =
      new剤形区分 === "医療材料" ? "医療材料" : "医薬品";
    if (
      (剤形区分 === "内服" && new剤形区分 === "頓服") ||
      (剤形区分 === "頓服" && new剤形区分 === "内服")
    ) {
      剤形区分 = new剤形区分;
      情報区分 = new情報区分;
    } else {
      剤形区分 = new剤形区分;
      情報区分 = new情報区分;
      薬品コード種別 = "レセプト電算処理システム用コード";
      薬品コード = "";
      薬品名称 = "";
      分量 = "";
      単位名 = undefined;
      drugFormKey += 1;
    }
  }

  function doDrugKindChange(arg: {
    情報区分: 情報区分;
    薬品コード種別: 薬品コード種別;
    薬品コード: string;
    薬品名称: string;
    単位名: string | undefined;
  }) {
    情報区分 = arg.情報区分;
    薬品コード種別 = arg.薬品コード種別;
    薬品コード = arg.薬品コード;
    薬品名称 = arg.薬品名称;
    単位名 = arg.単位名;
  }
</script>

<ZaikeiKubunForm {剤形区分} onChange={doZaikeiKubunChange} />
{#key drugFormKey}
  <DrugKind
    {情報区分}
    bind:薬品コード種別
    bind:薬品コード
    bind:薬品名称
    bind:単位名
    {at}
    onChange={doDrugKindChange}
  />
{/key}
<div class="form-part">
  <DrugAmount bind:分量 単位名={単位名 || ""} />
</div>

<style>
  .form-part {
    margin: 10px 0;
  }
</style>
