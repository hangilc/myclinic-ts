<script lang="ts">
  import { type DiseaseData, fullName, startDateRep } from "./types";
  import { genid } from "@/lib/genid"
    import EditableDate from "@/lib/editable-date/EditableDate.svelte";

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
  <div>
    <EditableDate bind:date={endDate} />
  </div>
</div>
