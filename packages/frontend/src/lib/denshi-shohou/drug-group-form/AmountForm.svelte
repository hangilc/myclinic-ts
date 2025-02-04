<script lang="ts">
  import { toHankaku } from "@/lib/zenkaku";
  import { onMount } from "svelte";

  export let amount: string;
  export let unit: string;

  let inputElement: HTMLInputElement;

  onMount(() => {
    inputElement?.focus();
  });
</script>

<div>
  <input
    type="text"
    bind:value={amount}
    bind:this={inputElement}
    style="width:4em;"
  />
  {unit}
</div>
