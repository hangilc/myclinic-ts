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
  import Cog from "@/icons/Cog.svelte";
  import Uneven from "./drug-form/Uneven.svelte";

  export let at: string;
  export let 剤形区分: 剤形区分;
  export let 情報区分: 情報区分;
  export let 薬品コード種別: 薬品コード種別;
  export let 薬品コード: string;
  export let 薬品名称: string;
  export let 分量: string;
  export let 単位名: string | undefined;
  export let 不均等レコード: 不均等レコード | undefined;

  let drugFormKey = 1;
  let drugKindFocus: () => boolean;
  let showAux = false;
  let unevenIsEditing = false;

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

  function doUneven() {
	if( !不均等レコード ){
	  不均等レコード = {
		不均等１回目服用量: "1",
		不均等２回目服用量: "2",
	  };
	  unevenIsEditing = true;
	}
  }
  
</script>

<ZaikeiKubunForm bind:剤形区分 notifyChange={doZaikeiKubunChange} />
{#key drugFormKey}
  <DrugKind
    {情報区分}
    bind:薬品コード種別
    bind:薬品コード
    bind:薬品名称
    bind:単位名
    {不均等レコード}
    {at}
    onChange={doDrugKindChange}
    bind:focus={drugKindFocus}
  />
{/key}
<div class="form-part">
  <DrugAmount bind:分量 単位名={単位名 || ""} />
</div>
{#if 不均等レコード}
  <div>
    <Uneven bind:不均等レコード bind:isEditing={unevenIsEditing}/>
  </div>
{/if}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div>
  <span class="cog" on:click={() => (showAux = !showAux)}><Cog /></span>
</div>
{#if showAux}
  <!-- svelte-ignore a11y-invalid-attribute -->
  <div>
    {#if !不均等レコード}
      <a href="javascript:void(0)" on:click={doUneven}>不均等</a>
    {/if}
  </div>
{/if}

<style>
  .form-part {
    margin: 10px 0;
  }

  .cog {
    color: gray;
    cursor: pointer;
  }
</style>
