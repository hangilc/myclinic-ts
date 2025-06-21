<script lang="ts">
  import { onMount } from "svelte";
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
  import CogLink from "./icons/CogLink.svelte";
  import "./widgets/style.css";

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
  export let showAux = false;

  let drugFormKey = 1;
  let drugKindFocus: () => boolean;

  onMount(() => {
    drugKindFocus();
  });

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
  }

  function doUneven() {
    if (!不均等レコード) {
      不均等レコード = {
        不均等１回目服用量: "1",
        不均等２回目服用量: "2",
      };
      isEditing不均等レコード = true;
    }
  }

  function doHosoku() {
    if (!薬品補足レコード) {
      薬品補足レコード = [];
    }
    薬品補足レコード.push(index薬品補足レコード({ 薬品補足情報: "" }));
    薬品補足レコード = 薬品補足レコード;
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
    bind:focus={drugKindFocus}
  />
{/key}
<div class="label">分量</div>
<DrugAmount bind:分量 bind:isEditing={isEditing分量} {単位名} />
<div style="vert-align:middle;margin-top:8px;">
  <div class="label" style="display:inline-block;">その他</div>
  <CogLink onClick={() => (showAux = !showAux)} style="margin-left: 1em;" />
</div>
{#if 不均等レコード}
  <div>
    <div class="label">不均等</div>
    <Uneven bind:不均等レコード bind:isEditing={isEditing不均等レコード} />
  </div>
{/if}
{#if 薬品補足レコード.length > 0}
  <div>
    <div class="label">補足</div>
    <Hosoku bind:薬品補足レコード />
  </div>
{/if}
{#if showAux}
  <!-- svelte-ignore a11y-invalid-attribute -->
  <div>
    {#if !不均等レコード}
      <a href="javascript:void(0)" on:click={doUneven}>不均等</a>
    {/if}
    <a href="javascript:void(0)" on:click={doHosoku}>補足レコード</a>
  </div>
{/if}

<style>
</style>
