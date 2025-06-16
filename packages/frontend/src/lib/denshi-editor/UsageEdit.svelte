<script lang="ts">
  import DrugUsage from "./DrugUsage.svelte";

  export let onDone: () => void;
  export let 用法コード: string;
  export let 用法名称: string;
  export let onChange: (date: {
	用法コード: string,
	用法名称: string,
  }) => void;

  let isEditing = true;
  
  function doEnter() {
	if( isEditing ){
	  return;
	}
	onDone();
	onChange({ 用法コード, 用法名称 });
  }

</script>

<div>用法の編集</div>
<DrugUsage bind:用法コード bind:用法名称 bind:isEditing />
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
