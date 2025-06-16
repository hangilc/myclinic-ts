<script lang="ts">
  import type { 薬品情報Indexed } from "./denshi-editor-types";
  import DrugDays from "./DrugDays.svelte";
  import DrugUsage from "./DrugUsage.svelte";
  import type {
    剤形区分,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import { drugRep } from "./helper";
  import { toHankaku } from "@/lib/zenkaku";

  export let onDone: () => void;
  export let 用法コード: string;
  export let 用法名称: string;
  export let 調剤数量: number;
  export let 剤形区分: 剤形区分;
  export let drugs: 薬品情報Indexed[];
  export let onChange: (date: {
	用法コード: string,
	用法名称: string,
	調剤数量: number;
  }) => void;

  let isEditing = false;
  let 調剤数量value: string = 調剤数量.toString();
  
  function doEnter() {
	if( isEditing ){
	  return;
	}
	let n = parseInt(toHankaku(調剤数量value));
	if( isNaN(n) ){
	  alert("日数・回数が整数でありません。");
	  return;
	}
	if( n <= 0 ){
	  alert("日数・回数が正の値でありません。");
	  return;
	}
	onDone();
	onChange({ 用法コード, 用法名称, 調剤数量: n });
  }

</script>

<div>薬剤グループの編集</div>
<div class="drugs">
{#each drugs as drug (drug.id)}
  <div>・</div>
  <div>{drugRep(drug)}</div>
{/each}
</div>
<DrugUsage bind:用法コード bind:用法名称 bind:isEditing />
{#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
  <DrugDays bind:timesText={調剤数量value} {剤形区分}/>
{/if}
<div class="commands">
  {#if !isEditing}
	<button on:click={doEnter}>入力</button>
  {/if}
  <button on:click={onDone}>キャンセル</button>
</div>

<style>
  .drugs {
	margin: 10px 0;
	border: 1px solid gray;
	border-radius: 4px;
	padding: 10px;
	line-height: 1.5;
	display: grid;
	grid-template-columns: auto 1fr;
  }
  .commands {
    text-align: right;
  }
</style>
