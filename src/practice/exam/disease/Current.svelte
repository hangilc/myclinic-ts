<script lang="ts">
  import * as kanjidate from "kanjidate"
  import { type DiseaseData, fullName } from "./types"

  export let list: DiseaseData[];

  function formatStartDate(src: string): string {
    return kanjidate.format(kanjidate.f3, src);
  }
</script>

<div>
  {#each list as d (d[0].diseaseId)}
  {@const startDate=formatStartDate(d[0].startDate)}
  <div>
    <span>{fullName(d)}</span>
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