<script lang="ts">
    import type { ConductEx, VisitEx } from "@/lib/model";
    import { parseDrugLines } from "@/lib/shohousen/parse-shohousen";
    import { shinryouDeleted } from "@/practice/app-events";
    import ConductItem from "./ConductItem.svelte";


  export let conducts: ConductEx[];
  export let visit: VisitEx;

</script>

{#each conducts as conduct (conduct.conductId)}
<ConductItem conduct={conduct} visit={visit} />
{/each}