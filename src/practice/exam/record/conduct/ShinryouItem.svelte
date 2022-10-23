<script lang="ts">
  import type { ConductShinryouEx } from "@/lib/model";

  let mode = "disp";

  export let conductShinryou: ConductShinryouEx;
</script>

{#if mode === "disp"}
<div>* {conductShinryou.master.name}</div>
{/if}

