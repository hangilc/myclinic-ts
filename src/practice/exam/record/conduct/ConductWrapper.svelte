<script lang="ts">
    import type { ConductEx } from "@/lib/model";
    import { parseDrugLines } from "@/lib/shohousen/parse-shohousen";
    import { shinryouDeleted } from "@/practice/app-events";
    import ConductItem from "./ConductItem.svelte";


  export let conducts: ConductEx[];

</script>

{#each conducts as conduct (conduct.conductId)}
<ConductItem conduct={conduct} />
  {#each conduct.shinryouList as shinryou (shinryou.conductShinryouId)}
    <div>* {shinryou.master.name}</div>
  {/each}
  {#each conduct.drugs as drug (drug.conductDrugId)}
    <div>* {drug.master.name} {drug.amount}{drug.master.unit}</div>
  {/each}
  {#each conduct.kizaiList as kizai (kizai.conductKizaiId)}
    <div>* {kizai.master.name} {kizai.amount}{kizai.master.unit}</div>
  {/each}
{/each}