<script lang="ts">
  import type { ConductEx, VisitEx } from "@/lib/model";
  import ConductItem from "./ConductItem.svelte";

  export let conducts: ConductEx[];
  export let visit: VisitEx;
</script>

{#each conducts as conduct (conduct.conductId)}
  <ConductItem {conduct} {visit} />
{/each}
