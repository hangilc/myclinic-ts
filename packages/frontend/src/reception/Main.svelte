<script lang="ts">
  import type { Writable } from "svelte/store";
  import Cashier from "@/cashier/Cashier.svelte"
  import Scan from "@/scan/Scan.svelte";
  
  export let serviceStore: Writable<string>;
</script>
 
<div>
  {#if $serviceStore === "main"}
  <Cashier />
  {:else if $serviceStore === "scan"}
  <Scan />
  {/if}
</div>