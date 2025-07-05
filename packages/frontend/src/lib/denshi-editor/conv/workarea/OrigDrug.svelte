<script lang="ts">
  import type { Drug } from "@/lib/parse-shohou";
  import { unconvDrugRep } from "../../helper";

  export let drug: Drug;
</script>

<div class="top">
  {unconvDrugRep(drug)}
</div>

<style>
  .top {
    margin-bottom: 6px;
    border-bottom: 6px;
    border-bottom: var(--border);
    padding-bottom: 8px;
  }
</style>