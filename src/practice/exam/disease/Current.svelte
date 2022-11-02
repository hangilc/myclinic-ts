<script lang="ts">
  import type { 
    Disease,
    ByoumeiMaster,
    DiseaseAdj,
    ShuushokugoMaster,
  } from "@/lib/model"
  import * as kanjidate from "kanjidate"

  export let list: [Disease, ByoumeiMaster, [DiseaseAdj, ShuushokugoMaster][]][];

  function formatStartDate(src: string): string {
    return kanjidate.format(kanjidate.f3, src);
  }
</script>

<div>
  {#each list as d (d[0].diseaseId)}
  {@const startDate=formatStartDate(d[0].startDate)}
  <div>
    <span>{d[1].name}</span>
    <span class="start-date">({startDate})</span>
  </div>
  {/each}
</div>

<style>
  .start-date {
    font-size: 100%;
    color: #666;
  }
</style>