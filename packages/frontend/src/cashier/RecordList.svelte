<script lang="ts">
  import api from "@/lib/api";
  import { calcPages } from "@/lib/calc-pages";
  import Nav from "@/lib/Nav.svelte";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient, VisitEx } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";

  export let destroy: () => void;
  export let totalVisits: number;
  export let patient: Patient;
  export let records: VisitEx[] = [];
  const itemsPerPage = 10;
  let page: Writable<number> = writable(0);
  let totalPages: number = calcPages(totalVisits, itemsPerPage);

  page.subscribe(doGotoPage);

  async function fetchRecords(patientId: number, page: number) {
    return await api.listVisitEx(patientId, itemsPerPage * page, itemsPerPage);
  }

  async function doGotoPage(page: number) {
    records = await fetchRecords(patient.patientId, page);
  }
</script>

<SurfaceModal {destroy} title="診療録">
  <Nav page={$page} total={totalPages} gotoPage={doGotoPage} />
  <div>
    ({patient.patientId}) {patient.fullName()}
  </div>
  <div>
    {#each records as rec (rec.visitId)}
      <div>
        {rec.visitId}
      </div>
    {/each}
  </div>
</SurfaceModal>
