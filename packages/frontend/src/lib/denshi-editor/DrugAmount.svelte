<script lang="ts">
  import { toHankaku } from "@/lib/zenkaku";
  import CancelIcon from "./icons/CancelIcon.svelte";
  import SubmitIcon from "./icons/SubmitIcon.svelte";

  export let 分量: string;
  export let isEditing: boolean;
  export let 単位名: string;

  let inputText: string = 分量;

  function doEnter() {
	let f = parseFloat(toHankaku(inputText.trim()));
	if( isNaN(f) ){
	  alert("分量の値が数値でありません。");
	  return;
	}
	分量 = f.toString();
	inputText = 分量;
	isEditing = false;
  }

  function doCancel() {
	isEditing = false;
  }

  function doEdit() {
	inputText = 分量;
	isEditing = true;
  }
</script>

{#if isEditing}
  <form on:submit|preventDefault={doEnter}>
    <input type="text" bind:value={inputText} />
    {単位名}
    <SubmitIcon onClick={doEnter} />
    <CancelIcon onClick={doCancel} />
  </form>
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="rep" on:click={doEdit}>分量：{分量}{単位名}</div>
{/if}

<style>
  input {
    width: 4em;
  }

  .rep {
	cursor: pointer;
  }

  
</style>
