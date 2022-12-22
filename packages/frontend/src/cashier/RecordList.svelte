<script lang="ts">
  import api from "@/lib/api";
  import { calcPages } from "@/lib/calc-pages";
  import Nav from "@/lib/Nav.svelte";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient, VisitEx } from "myclinic-model";
  import { tick } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import Record from "./Record.svelte";

  export let destroy: () => void;
  export let totalVisits: number;
  export let patient: Patient;
  export let records: VisitEx[] = [];
  const itemsPerPage = 10;
  let page: Writable<number> = writable(0);
  let totalPages: number = calcPages(totalVisits, itemsPerPage);
  let wrapper: HTMLElement;

  page.subscribe(async (newPage) => {
    records = await api.listVisitEx(
      patient.patientId,
      itemsPerPage * newPage,
      itemsPerPage
    );
    await tick();
    wrapper.scrollTop = 0;
  });

  async function doGotoPage(nextPage: number) {
    page.set(nextPage);
  }
</script>

<SurfaceModal {destroy} title="診療録" width="500px">
  <Nav page={$page} total={totalPages} gotoPage={doGotoPage} />
  <div>
    ({patient.patientId}) {patient.fullName()}
  </div>
  <div class="records" bind:this={wrapper}>
    {#each records as rec (rec.visitId)}
      <Record visit={rec} />
    {/each}
  </div>
</SurfaceModal>

<style>
  .records {
    max-height: 500px;
    overflow-y: auto;
    width: 100%;
  }
</style>
