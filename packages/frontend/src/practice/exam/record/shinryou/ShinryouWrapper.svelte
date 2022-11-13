<script lang="ts">
  import type { VisitEx } from "myclinic-model";
  import ShinryouItem from "./ShinryouItem.svelte"

  export let visit: VisitEx;
</script>

<div>
  {#each visit.shinryouList as shinryou (shinryou.shinryouId)}
  <ShinryouItem shinryou={shinryou} />
  {/each}
</div>