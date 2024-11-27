<script lang="ts">
  import type { Patient, Text, Visit } from "myclinic-model";
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/motion";
  import type { Writable } from "svelte/store";
  import api from "./api";

  export let patient: Writable<Patient | undefined>;
  let unsubs: Unsubscriber[] = [];
  let visits: { visit: Visit; texts: Text[] }[] = [];
  let currentPage = 0;
  let totalPages = 0;

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

  unsubs.push(
    patient.subscribe(async (patient) => {
      if (patient === undefined) {
        visits = [];
      } else {
        const nVisits = await api.countVisitByPatient(patient.patientId);
        const itemsPerPage = 10;
        totalPages =
          nVisits <= 0
            ? 0
            : Math.floor((nVisits + itemsPerPage - 1) / itemsPerPage);
        currentPage = 0;
        updateVisits();
      }
    })
  );

  async function updateVisits() {
    if( $patient && currentPage < totalPages ) {
        const visitIds = await api.listVisitIdByPatientReverse(
          patient.patientId,
          0,
          10
        );
        visits = await Promise.all(
          visitIds.map(async (visitId) => {
            return {
              visit: await api.getVisit(visitId),
              texts: await api.listTextForVisit(visitId),
            };
          })
        );
    }
  }
</script>

<div>
  {#if totalPages > 1}
    <div>
      {currentPage + 1} / {totalPages}
    </div>
  {/if}
  {#each visits as visit (visit.visit.visitId)}
    <div>
      {visit.visit.visitedAt}
    </div>
    {#each visit.texts as text (text.textId)}
      <div>
        {text.content}
      </div>
    {/each}
  {/each}
</div>
