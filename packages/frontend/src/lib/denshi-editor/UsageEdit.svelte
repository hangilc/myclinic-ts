<script lang="ts">
import DrugUsage from "./DrugUsage.svelte";

  export let onDone: () => void;
  export let 用法コード: string;
  export let 用法名称: string;
  export let 調剤数量: number;
  export let 単位名: string | undefined;
  export let onChange: (date: {
	用法コード: string,
	用法名称: string,
	調剤数量: number;
  }) => void;

  let isEditing = true;
  let 調剤数量value: string = 調剤数量.toString();
  
  function doEnter() {
	if( isEditing ){
	  return;
	}
	let n = parseInt(調剤数量value);
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

<div>用法の編集</div>
<DrugUsage bind:用法コード bind:用法名称 bind:isEditing />
{#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
  <DrugDays bind:剤形区分 bind:timesText />
{/if}
<div class="commands">
  {#if !isEditing}
	<button on:click={doEnter}>入力</button>
  {/if}
  <button on:click={onDone}>キャンセル</button>
</div>

<style>
  .commands {
    text-align: right;
  }
</style>
