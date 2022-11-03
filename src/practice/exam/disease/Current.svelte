<script lang="ts">
  import * as kanjidate from "kanjidate"
  import { type DiseaseData, fullName, startDateRep } from "./types"

  export let list: DiseaseData[];

</script>

<div>
  {#each list as d (d[0].diseaseId)}
  <div>
    <span>{fullName(d)}</span>
    <span class="start-date">({startDateRep(d)})</span>
  </div>
  {/each}
</div>

<style>
  .start-date {
    font-size: 100%;
    color: #666;
  }
</style>
