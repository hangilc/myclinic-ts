<script lang="ts">
  import { onMount } from "svelte";

  export let amount: string;
  export let unit: string;
</script>

<div>
  <input
    type="text"
    bind:value={amount}
    style="width:4em;"
  />
  {unit}
</div>
