<script lang="ts">
  import { onMount } from "svelte";
  import Dialog from "../Dialog.svelte";

  export let destroy: () => void;
  export let onEnter: (text: string) => void;
  let input = "";
  let inputElement: HTMLInputElement;

  onMount(() => {
    inputElement?.focus();
  })

  function doEnter() {
    input = input.trim();
    if( input !== "" ){
      destroy();
      onEnter(input);
    }
  }
</script>

<Dialog title="自由文章用法" {destroy}>
  <input type="text" bind:value={input} bind:this={inputElement} />
  <button on:click={doEnter}>入力</button>
</Dialog>