<script lang="ts">
  import { toHankaku } from "@/lib/zenkaku";
  import { onMount } from "svelte";


  export let amount: number | undefined;
  export let unit: string | undefined;
  export let onDone: (value: number) => void;

  console.log("unit", unit);
  
  let inputText = "";
  let inputElement: HTMLInputElement;

  if (amount !== undefined) {
    inputText = amount.toString();
  }

  onMount(() => {
    inputElement?.focus();
  });

  function doEnter() {
    const value = parseFloat(toHankaku(inputText.trim()));
    if( isNaN(value) ){
      alert("入力が数値でありません。");
      return;
    }
    if( !(value > 0) ){
      alert("値が正の数値でありません。");
      return;
    }
    onDone(value);
  }
</script>

<form on:submit|preventDefault={doEnter}>
  <input type="text" bind:value={inputText} bind:this={inputElement} style="width:4em;"/> {unit ?? ""}
</form>
