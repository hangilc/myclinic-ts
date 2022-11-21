<script lang="ts">
  import type { Writable } from "svelte/store";
  import ReceptionMain from "./main/ReceptionMain.svelte";
  import Scan from "./scan/Scan.svelte";
  
  export let serviceStore: Writable<string>;
</script>

<div>
  <ReceptionMain isVisible={$serviceStore === "main"}/>
  <Scan isVisible={$serviceStore === "scan"}/>
</div>