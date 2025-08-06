<script lang="ts">
  import type { 不均等レコード } from "@/lib/denshi-shohou/presc-info";
  import DrugAmount from "./DrugAmount.svelte";
  import DrugKind from "./DrugKind.svelte";
  import ZaikeiKubunForm from "./ZaikeiKubunForm.svelte";
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import Uneven from "./drug-form/Uneven.svelte";
  import Hosoku from "./drug-form/Hosoku.svelte";
  import {
  index薬品補足レコード,
    type 薬品補足レコードIndexed,
  } from "./denshi-editor-types";
  import "./widgets/style.css";
  import SmallLink from "./widgets/SmallLink.svelte";

  export let at: string;
  export let 剤形区分: 剤形区分;
  export let 情報区分: 情報区分;
  export let 薬品コード種別: 薬品コード種別;
  export let 薬品コード: string;
  export let isEditing薬品コード: boolean;
  export let 薬品名称: string;
  export let 分量: string;
  export let isEditing分量: boolean;
  export let 単位名: string;
  export let 不均等レコード: 不均等レコード | undefined;
  export let isEditing不均等レコード: boolean;
  export let 薬品補足レコード: 薬品補足レコードIndexed[];
  export let on剤形区分Change: (kubun: 剤形区分) => void = _ => {};

  let drugFormKey = 1;
  let focusDrugKind: (() => void) | undefined = undefined;

  export const focus: () => void = () => {
    // if( focusDrugKind ){
    //   focusDrugKind();
    // }
  }

  function doZaikeiKubunChange(prev剤形区分: 剤形区分) {
    情報区分 = 剤形区分 === "医療材料" ? "医療材料" : "医薬品";
    if (
      (剤形区分 === "内服" && prev剤形区分 === "頓服") ||
      (剤形区分 === "頓服" && prev剤形区分 === "内服")
    ) {
      // nop
    } else {
      薬品コード種別 = "レセプト電算処理システム用コード";
      薬品コード = "";
      薬品名称 = "";
      分量 = "";
      単位名 = "";
      drugFormKey += 1;
    }
    on剤形区分Change(剤形区分);
  }

  function addHosoku() {
    薬品補足レコード = [...薬品補足レコード, index薬品補足レコード({
      薬品補足情報: ""
    })];
  }

  function doUneven() {
    不均等レコード = {
      "不均等１回目服用量": "2",
      "不均等２回目服用量": "1",
    };
    isEditing不均等レコード = true;
  }

</script>

<div class="label">剤形</div>
<ZaikeiKubunForm bind:剤形区分 notifyChange={doZaikeiKubunChange} />
{#key drugFormKey}
  <DrugKind
    {情報区分}
    bind:薬品コード種別
    bind:薬品コード
    bind:isEditing薬品コード
    bind:薬品名称
    bind:単位名
    {at}
    bind:focus={focusDrugKind}
  />
{/key}
<DrugAmount bind:分量 bind:isEditing={isEditing分量} {単位名} />
{#if 不均等レコード}
  <div>
    <div class="label">不均等</div>
    <Uneven bind:不均等レコード bind:isEditing={isEditing不均等レコード} />
  </div>
{/if}
{#if 薬品補足レコード.length > 0}
  <div>
    <div class="label">薬品補足</div>
    <Hosoku bind:薬品補足レコード />
  </div>
{/if}
<div class="label">その他（薬品）</div>
<div>
  <SmallLink onClick={addHosoku}>薬品補足</SmallLink>
  {#if !不均等レコード}
  <SmallLink onClick={doUneven}>不均等</SmallLink>
  {/if}
</div>

