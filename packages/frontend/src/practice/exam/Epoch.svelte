<script lang="ts">
  import { onDestroy } from "svelte";
  import { currentPatient } from "./exam-vars";
  import api from "@/lib/api";
  import type { Visit } from "myclinic-model";
  import { DateWrapper } from "myclinic-util";

  const unsubs: (() => void)[] = [];
  let epochs: { id: number, text: string, visit: Visit }[] = [];
  let index = 1;

  unsubs.push(currentPatient.subscribe(async (patient) => {
    if( patient ){
      const texts = await api.searchTextForPatient("[[EPOCH]]", patient.patientId, 200, 0);
      texts.sort((a, b) => -a[1].visitedAt.localeCompare(b[1].visitedAt));
      epochs = texts.map(([t, v]) => ({ id: index++, text: t.content, visit: v }));
    } else {
      epochs = [];
    }
  }));

  onDestroy(() => unsubs.forEach(sub => sub()));
  
  function formatEpoch(e: { text: string }): string {
    let t = e.text.replaceAll(/\[\[EPOCH\]\]\s*\n?/g, "");
    t = t.replaceAll(/^●.*\n?/mg, "");
    t = t.trim();
    t = t.replaceAll("\n", "<br />\n");
    return t;
  }

  function formatDate(at: string): string {
    return DateWrapper.from(at).render(d => `${d.getGengou()}${d.getNen()}年${d.getMonth()}月${d.getDay()}日`)
  }

</script>

<div>
  {#each epochs as epoch (epoch.id)}
    <div class="epoch">
      <div class="date">{formatDate(epoch.visit.visitedAt)}</div>
      <div>{@html formatEpoch(epoch)}</div>
    </div>
  {/each}
</div>

<style>
  .epoch {
    margin: 10px 0;
    font-size: 14px;
    padding: 4px;
    border-radius: 6px;
    border: 1px solid gray;
  }

  .epoch .date {
    color: green;
  }
</style>
