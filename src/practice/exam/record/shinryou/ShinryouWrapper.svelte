<script lang="ts">
  import type { VisitEx } from "@/lib/model";

  export let visit: VisitEx;
</script>

<div>
  {#each visit.shinryouList as shinryou (shinryou.shinryouId)}
  <div>{shinryou.master.name}</div>
  {/each}
</div>