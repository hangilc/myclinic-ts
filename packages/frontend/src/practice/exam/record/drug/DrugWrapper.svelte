<script lang="ts">
  import { formatVisitDrug } from "@/lib/format-visit-drug";
  import type { DrugEx, VisitEx } from "myclinic-model";

  export let visit: VisitEx;

  function format(index: number, drug: DrugEx){
    return formatVisitDrug(index, drug);
  }
</script>

<div>
  {#each visit.drugs as drug, i (drug.drugId)}
    <div>
      {format(i+1, drug)}
    </div>
  {/each}
</div>