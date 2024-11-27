<script lang="ts">
  import type { Patient, Text, Visit } from "myclinic-model";
  import { onDestroy, tick } from "svelte";
  import type { Unsubscriber } from "svelte/motion";
  import type { Writable } from "svelte/store";
  import api from "./api";
  import { DateWrapper } from "myclinic-util";
  import { formatVisitText } from "./format-visit-text";

  export let patient: Writable<Patient | undefined>;
  let unsubs: Unsubscriber[] = [];
  let visits: { visit: Visit; texts: Text[] }[] = [];
  let currentPage = 0;
  let totalPages = 0;
  let itemsPerPage = 10;
  let lowerNav: HTMLElement;

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

  unsubs.push(
    patient.subscribe(async (patient) => {
      if (patient === undefined) {
        visits = [];
        totalPages = 0;
        currentPage = 0;
      } else {
        const nVisits = await api.countVisitByPatient(patient.patientId);
        totalPages =
          nVisits <= 0
            ? 0
            : Math.floor((nVisits + itemsPerPage - 1) / itemsPerPage);
        currentPage = 0;
        updateVisits(true);
      }
    })
  );

  async function updateVisits(firstLoad: boolean = false) {
    if ($patient) {
      if (currentPage >= 0 && currentPage < totalPages) {
        const visitIds = await api.listVisitIdByPatientReverse(
          $patient.patientId,
          currentPage * itemsPerPage,
          itemsPerPage
        );
        visits = await Promise.all(
          visitIds.map(async (visitId) => {
            return {
              visit: await api.getVisit(visitId),
              texts: await api.listTextForVisit(visitId),
            };
          })
        );
        if (!firstLoad) {
          await tick();
          lowerNav.scrollIntoView();
        }
      }
    }
  }

  function titleRep(visitedAt: string): string {
    return DateWrapper.from(visitedAt).render(
      (d) => `${d.gengou}${d.nen}年${d.month}月${d.day}日`
    );
  }

  function formatContent(c: string): string {
    return formatVisitText(c);
  }

  function gotoPage(page: number) {
    if (page >= 0 && page < totalPages) {
      currentPage = page;
      updateVisits();
    }
  }
</script>

<div>
  {#if totalPages > 1}
    <div>
      <a href="javascript:void(0)" on:click={() => gotoPage(0)}>最初</a>
      <a href="javascript:void(0)" on:click={() => gotoPage(currentPage - 1)}
        >前へ</a
      >
      {currentPage + 1} / {totalPages}
      <a href="javascript:void(0)" on:click={() => gotoPage(currentPage + 1)}
        >次へ</a
      >
      <a href="javascript:void(0)" on:click={() => gotoPage(totalPages - 1)}
        >最後</a
      >
    </div>
  {/if}
  {#each visits as visit (visit.visit.visitId)}
    <div class="visit-title">
      {titleRep(visit.visit.visitedAt)}
    </div>
    {#each visit.texts as text (text.textId)}
      <div class="text-content">
        {@html formatContent(text.content)}
      </div>
    {/each}
  {/each}
  {#if totalPages > 1}
    <div bind:this={lowerNav}>
      <a href="javascript:void(0)" on:click={() => gotoPage(0)}>最初</a>
      <a href="javascript:void(0)" on:click={() => gotoPage(currentPage - 1)}
        >前へ</a
      >
      {currentPage + 1} / {totalPages}
      <a href="javascript:void(0)" on:click={() => gotoPage(currentPage + 1)}
        >次へ</a
      >
      <a href="javascript:void(0)" on:click={() => gotoPage(totalPages - 1)}
        >最後</a
      >
    </div>
  {/if}
</div>

<style>
  .visit-title {
    background-color: lightgreen;
    padding: 2px;
  }

  .text-content {
    padding: 4px 10px;
    font-size: 14px;
  }
</style>
