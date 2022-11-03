<script lang="ts">
  import { type DiseaseData, fullName, startDateRep } from "./types";
  import { genid } from "@/lib/genid"
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";

  export let current: DiseaseData[];
  let selected: DiseaseData[] = [];
  $: console.log(selected);
  let endDate: Date = new Date();
</script>

<div>
  {#each current as d}
  {@const id=genid()}
  <div>
    <input type="checkbox" id={id} bind:group={selected} value={d}/> 
    <label for={id}>{fullName(d)} ({startDateRep(d)})</label>
  </div>
  {/each}
  <div class="date-wrapper">
    <DateFormWithCalendar date={endDate} iconWidth="18px">
      <span slot="spacer" style:width="6px"/>
    </DateFormWithCalendar>
  </div>
</div>

<style>
  .date-wrapper {
    font-size: 13px;
  }

  .date-wrapper :global(input) {
    padding: 0px;
  }
</style>
