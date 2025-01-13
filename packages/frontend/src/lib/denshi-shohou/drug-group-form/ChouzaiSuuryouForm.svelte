<script lang="ts">
  import { toHankaku } from "@/lib/zenkaku";
  import { onMount } from "svelte";

  export let 調剤数量: number | undefined = undefined;
  export let onDone: (value: number) => void;

  let input = 調剤数量 == undefined ? "" : 調剤数量.toString();
  let element: HTMLInputElement;

  onMount(() => {
    element?.focus();
  });

  function doEnter() {
    const value = parseFloat(toHankaku(input.trim()));
    if( isNaN(value) ){
      alert("調剤数量の入力が数値でありません。");
      return;
    }
    onDone(value);
  }
</script>
<form on:submit|preventDefault={doEnter}>
  <input type="text" bind:value={input} bind:this={element}/>
</form>